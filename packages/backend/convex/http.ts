import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";

type ClerkWebhookEvent = {
  type: string;
  data: {
    id?: string;
    [key: string]: unknown;
  };
};

const http = httpRouter();

//clerk auth
http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const event = await validateRequest(request);
    if (!event) {
      return new Response("Invalid webhook request", { status: 400 });
    }

    switch (event.type) {
      case "user.created":
      case "user.updated":
        await ctx.runMutation(internal.users.addOrUpdateUser, { data: event.data });
        break;

      case "user.deleted": {
        const clerkUserId = event.data.id;
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

// scraper ingest
http.route({
  path: "/ingest-event",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // 1. Enforce Auth: Check for our shared secret
    const authHeader = request.headers.get("Authorization");
    const expectedSecret = process.env.SCRAPER_SECRET;

    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      return new Response("Unauthorized: Invalid or missing secret.", {
        status: 401,
      });
    }

    try {
      // 2. Parse the incoming JSON from the scraper
      const eventData = await request.json();

      // 3. Save to database using the internal mutation
      await ctx.runMutation((internal as any).admin.ingestEventInternal, { eventData }); //passed internal as any to make it run for now ;D

      return new Response("Successfully ingested event", { status: 200 });
    } catch (error) {
      console.error("Ingestion failed:", error);
      return new Response("Bad Request: Invalid data format", { status: 400 });
    }
  }),
});

//validator
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
    return wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error("Error verifying Clerk webhook", err);
    return null;
  }
}

export default http;