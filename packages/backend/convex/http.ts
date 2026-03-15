import { httpRouter } from "convex/server";
import { Webhook } from "svix";

import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

type ClerkUserWebhookData = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  email_address: string | null;
  primary_email_address_id: string | null;
  email_addresses: Array<{ email_address: string; id: string }> | null;
};

type ClerkWebhookEvent = {
  id: string;
  type: string;
  data: Record<string, unknown>;
};

const http = httpRouter();
const webhookCorsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, svix-id, svix-timestamp, svix-signature",
};

function parseEmailAddresses(value: unknown): ClerkUserWebhookData["email_addresses"] {
  const emailAddressItems = (Array.isArray(value) ? value : []) as Array<{
    email_address?: string | null;
    id?: string | null;
  }>;

  const emailAddresses = emailAddressItems
    .map((email) => ({
      email_address: email.email_address ?? "",
      id: email.id ?? "",
    }))
    .filter((email) => email.email_address && email.id);

  return emailAddresses.length > 0 ? emailAddresses : null;
}

function parseClerkUserData(payload: Record<string, unknown>): ClerkUserWebhookData | null {
  const userData = payload as Partial<ClerkUserWebhookData> | null;
  if (!userData?.id) {
    return null;
  }

  return {
    id: userData.id,
    first_name: userData.first_name ?? null,
    last_name: userData.last_name ?? null,
    image_url: userData.image_url ?? null,
    email_address: userData.email_address ?? null,
    primary_email_address_id: userData.primary_email_address_id ?? null,
    email_addresses: parseEmailAddresses(userData.email_addresses),
  };
}

function parseClerkWebhookEvent(payload: unknown, messageId: string): ClerkWebhookEvent | null {
  const event = payload as Partial<ClerkWebhookEvent> | null;
  if (!event?.type || !event.data) {
    return null;
  }

  return {
    id: messageId,
    type: event.type,
    data: event.data as Record<string, unknown>,
  };
}

http.route({
  path: "/clerk-users-webhook",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: webhookCorsHeaders });
  }),
});

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const event = await validateRequest(request);
    if (!event) {
      return new Response("Invalid webhook request", { status: 400, headers: webhookCorsHeaders });
    }

    const receivedAt = Date.now();

    switch (event.type) {
      case "user.created":
      case "user.updated": {
        const userData = parseClerkUserData(event.data);
        if (!userData) {
          return new Response("Invalid user payload", { status: 400, headers: webhookCorsHeaders });
        }

        const result = await ctx.runMutation(internal.webhooks.processClerkEvent, {
          eventId: event.id,
          eventType: event.type,
          receivedAt,
          data: userData,
        });
        if (!result.accepted) {
          console.log("Ignoring duplicate Clerk webhook event:", event.id);
        }
        break;
      }

      case "user.deleted": {
        const clerkUserId = ((event.data as { id?: string }).id ?? "").trim();
        if (!clerkUserId) {
          return new Response("Missing user id in payload", {
            status: 400,
            headers: webhookCorsHeaders,
          });
        }

        const result = await ctx.runMutation(internal.webhooks.processClerkEvent, {
          eventId: event.id,
          eventType: event.type,
          receivedAt,
          data: { id: clerkUserId },
        });
        if (!result.accepted) {
          console.log("Ignoring duplicate Clerk webhook event:", event.id);
        }
        break;
      }

      default:
        console.log("Ignoring Clerk webhook event:", event.type);
        break;
    }

    return new Response(null, { status: 200, headers: webhookCorsHeaders });
  }),
});

async function validateRequest(request: Request): Promise<ClerkWebhookEvent | null> {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("MISSING CLERK_WEBHOOK_SIGNING_SECRET");
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
  const webhook = new Webhook(webhookSecret);

  try {
    webhook.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });

    const event = parseClerkWebhookEvent(JSON.parse(payload) as unknown, svixId);
    if (!event) {
      console.error("Invalid Clerk webhook payload shape");
      return null;
    }

    return event;
  } catch (error) {
    console.error("Error verifying Clerk webhook", error);
    return null;
  }
}

export default http;
