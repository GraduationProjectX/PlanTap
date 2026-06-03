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

type ClerkWebhookEventData = {
  id?: string;
  first_name?: string | null;
  last_name?: string | null;
  image_url?: string | null;
  email_address?: string | null;
  primary_email_address_id?: string | null;
  email_addresses?: Array<{ email_address?: string | null; id?: string | null }> | null;
  [key: string]: unknown;
};

type ClerkWebhookEvent = {
  id: string;
  type: string;
  data: ClerkWebhookEventData;
};

const http = httpRouter();
const webhookCorsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, svix-id, svix-timestamp, svix-signature",
};

function parseEmailAddresses(
  value: ClerkWebhookEventData["email_addresses"],
): ClerkUserWebhookData["email_addresses"] {
  if (!Array.isArray(value)) {
    return null;
  }

  const emailAddresses: Array<{ email_address: string; id: string }> = [];
  for (const item of value) {
    const emailAddress = item.email_address?.trim();
    const id = item.id?.trim();
    if (!emailAddress || !id) {
      continue;
    }

    emailAddresses.push({ email_address: emailAddress, id });
  }

  return emailAddresses.length > 0 ? emailAddresses : null;
}

function parseClerkUserData(payload: ClerkWebhookEventData): ClerkUserWebhookData | null {
  const id = payload.id;
  if (!id) {
    return null;
  }

  return {
    id,
    first_name: payload.first_name ?? null,
    last_name: payload.last_name ?? null,
    image_url: payload.image_url ?? null,
    email_address: payload.email_address ?? null,
    primary_email_address_id: payload.primary_email_address_id ?? null,
    email_addresses: parseEmailAddresses(payload.email_addresses),
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
        const clerkUserId = event.data.id?.trim() ?? "";
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
  const webhook = new Webhook(webhookSecret);

  try {
    webhook.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });

    const parsedPayload: { type?: string; data?: ClerkWebhookEventData } = JSON.parse(payload);
    if (!parsedPayload.type || !parsedPayload.data) {
      console.error("Invalid Clerk webhook payload shape");
      return null;
    }

    return {
      id: svixId,
      type: parsedPayload.type,
      data: parsedPayload.data,
    };
  } catch (error) {
    console.error("Error verifying Clerk webhook", error);
    return null;
  }
}

export default http;
