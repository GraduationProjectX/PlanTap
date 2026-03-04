import { httpRouter } from "convex/server";
import { Webhook } from "svix";

import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

type ClerkUserWebhookData = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  image_url?: string | null;
  email_address?: string | null;
  primary_email_address_id?: string | null;
  email_addresses?: Array<{ email_address: string; id: string }> | null;
};

type ClerkWebhookEvent = {
  id: string;
  type: string;
  data: Record<string, unknown>;
};

const http = httpRouter();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readOptionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function readOptionalNullableString(value: unknown): string | null | undefined {
  if (value === null) return null;
  if (typeof value === "string") return value;
  return undefined;
}

function isOptionalNullableString(value: unknown): value is string | null | undefined {
  return value === undefined || value === null || typeof value === "string";
}

function parseEmailAddresses(value: unknown): ClerkUserWebhookData["email_addresses"] | undefined {
  if (value == null) {
    return value === null ? null : undefined;
  }

  if (!Array.isArray(value)) {
    return undefined;
  }

  const emailAddresses: Array<{ email_address: string; id: string }> = [];
  for (const item of value) {
    if (!isRecord(item)) {
      return undefined;
    }

    const id = readOptionalString(item.id);
    const emailAddress = readOptionalString(item.email_address);
    if (!id || !emailAddress) {
      return undefined;
    }

    emailAddresses.push({ id, email_address: emailAddress });
  }

  return emailAddresses;
}

function parseClerkUserData(payload: Record<string, unknown>): ClerkUserWebhookData | null {
  const id = readOptionalString(payload.id);
  if (!id) {
    return null;
  }

  if (!isOptionalNullableString(payload.first_name)) return null;
  if (!isOptionalNullableString(payload.last_name)) return null;
  if (!isOptionalNullableString(payload.image_url)) return null;
  if (!isOptionalNullableString(payload.email_address)) return null;
  if (!isOptionalNullableString(payload.primary_email_address_id)) return null;

  const emailAddresses = parseEmailAddresses(payload.email_addresses);
  if (payload.email_addresses !== undefined && emailAddresses === undefined) {
    return null;
  }

  return {
    id,
    first_name: readOptionalNullableString(payload.first_name),
    last_name: readOptionalNullableString(payload.last_name),
    image_url: readOptionalNullableString(payload.image_url),
    email_address: readOptionalNullableString(payload.email_address),
    primary_email_address_id: readOptionalNullableString(payload.primary_email_address_id),
    email_addresses: emailAddresses,
  };
}

function parseClerkWebhookEvent(payload: unknown): ClerkWebhookEvent | null {
  if (!isRecord(payload)) {
    return null;
  }

  const id = readOptionalString(payload.id);
  const type = readOptionalString(payload.type);
  const data = payload.data;

  if (!id || !type || !isRecord(data)) {
    return null;
  }

  return {
    id,
    type,
    data,
  };
}

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const event = await validateRequest(request);
    if (!event) {
      return new Response("Invalid webhook request", { status: 400 });
    }

    const receivedAt = Date.now();
    const claim = await ctx.runMutation(internal.webhooks.markClerkEventProcessed, {
      eventId: event.id,
      eventType: event.type,
      receivedAt,
    });

    if (!claim.accepted) {
      console.log("Ignoring duplicate Clerk webhook event:", event.id);
      return new Response(null, { status: 200 });
    }

    switch (event.type) {
      case "user.created":
      case "user.updated": {
        const userData = parseClerkUserData(event.data);
        if (!userData) {
          return new Response("Invalid user payload", { status: 400 });
        }

        await ctx.runMutation(internal.users.addOrUpdateUser, { data: userData });
        break;
      }

      case "user.deleted": {
        const clerkUserId = readOptionalString(event.data.id);
        if (!clerkUserId) {
          return new Response("Missing user id in payload", { status: 400 });
        }

        await ctx.runMutation(internal.users.deleteUser, { clerkUserId });
        break;
      }

      default:
        console.log("Ignoring Clerk webhook event: ", event.type);
        break;
    }

    return new Response(null, { status: 200 });
  }),
});

async function validateRequest(request: Request): Promise<ClerkWebhookEvent | null> {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("MISSING CLERK_WEBHOOK_SECRET");
    return null;
  }

  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error("Missing required svix headers");
    return null;
  }

  const payload = await request.text();
  const wh = new Webhook(webhookSecret);

  try {
    const verified = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });

    const event = parseClerkWebhookEvent(verified);
    if (!event) {
      console.error("Invalid Clerk webhook payload shape");
      return null;
    }

    return event;
  } catch (err) {
    console.error("Error verifying Clerk webhook", err);
    return null;
  }
}

export default http;
