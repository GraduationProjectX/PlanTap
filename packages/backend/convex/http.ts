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
