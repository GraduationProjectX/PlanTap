import { v } from "convex/values";

import { internalMutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { getUserByClerkId } from "./lib/auth";

const clerkEmailAddressValidator = v.object({
  email_address: v.string(),
  id: v.string(),
});

const clerkUserDataValidator = v.object({
  id: v.string(),
  first_name: v.optional(v.union(v.string(), v.null())),
  last_name: v.optional(v.union(v.string(), v.null())),
  image_url: v.optional(v.union(v.string(), v.null())),
  email_address: v.optional(v.union(v.string(), v.null())),
  primary_email_address_id: v.optional(v.union(v.string(), v.null())),
  email_addresses: v.optional(v.union(v.array(clerkEmailAddressValidator), v.null())),
});

const clerkDeletedUserDataValidator = v.object({
  id: v.string(),
});

const clerkEventTypeValidator = v.union(
  v.literal("user.created"),
  v.literal("user.updated"),
  v.literal("user.deleted"),
);

type ClerkUserData = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  image_url?: string | null;
  email_address?: string | null;
  primary_email_address_id?: string | null;
  email_addresses?: Array<{
    email_address: string;
    id: string;
  }> | null;
};

function getPrimaryEmail(userData: ClerkUserData): string | null {
  if (userData.email_address) return userData.email_address;

  if (!userData.email_addresses?.length) return null;

  if (userData.primary_email_address_id) {
    const primary = userData.email_addresses.find(
      (email) => email.id === userData.primary_email_address_id,
    );
    if (primary) return primary.email_address;
  }

  const fallbackEmail = userData.email_addresses[0];
  return fallbackEmail?.email_address ?? null;
}

async function upsertClerkUser(ctx: MutationCtx, data: ClerkUserData) {
  const now = Date.now();
  const patch = {
    clerkUserId: data.id,
    email: getPrimaryEmail(data),
    firstName: data.first_name ?? null,
    lastName: data.last_name ?? null,
    imageUrl: data.image_url ?? null,
    locale: null,
    updatedAt: now,
  };

  const existingUser = await getUserByClerkId(ctx, data.id);
  if (existingUser) {
    await ctx.db.patch(existingUser._id, patch);
    return;
  }

  await ctx.db.insert("users", {
    ...patch,
    createdAt: now,
  });
}

async function deleteClerkUser(ctx: MutationCtx, clerkUserId: string) {
  const existingUser = await getUserByClerkId(ctx, clerkUserId);
  if (!existingUser) {
    return;
  }

  await ctx.db.delete(existingUser._id);
}

export const processClerkEvent = internalMutation({
  args: {
    eventId: v.string(),
    eventType: clerkEventTypeValidator,
    receivedAt: v.number(),
    data: v.union(clerkUserDataValidator, clerkDeletedUserDataValidator),
  },
  handler: async (ctx, { eventId, eventType, receivedAt, data }) => {
    const existing = await ctx.db
      .query("webhookEvents")
      .withIndex("by_provider_and_eventid", (q) => q.eq("provider", "clerk"))
      .filter((q) => q.eq(q.field("eventId"), eventId))
      .first();

    if (existing) {
      return { accepted: false };
    }

    if (eventType === "user.deleted") {
      await deleteClerkUser(ctx, data.id);
    } else {
      await upsertClerkUser(ctx, data);
    }

    await ctx.db.insert("webhookEvents", {
      provider: "clerk",
      eventId,
      eventType,
      receivedAt,
      processedAt: Date.now(),
    });

    return { accepted: true };
  },
});
