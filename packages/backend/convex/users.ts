import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

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

export const current = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", identity.subject))
      .unique();
  },
});

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

export const addOrUpdateUser = internalMutation({
  args: { data: clerkUserDataValidator },
  handler: async (ctx, { data }) => {
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

    const existUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", data.id))
      .unique();

    if (existUser) {
      await ctx.db.patch(existUser._id, patch);
      return existUser._id;
    }

    return await ctx.db.insert("users", {
      ...patch,
      createdAt: now,
    });
  },
});

export const deleteUser = internalMutation({
  args: { clerkUserId: v.string() },
  handler: async (ctx, { clerkUserId }) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();

    if (!existing) return null;

    await ctx.db.delete(existing._id);

    return existing._id;
  },
});
