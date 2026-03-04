import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

type ClerkEmailAddress = {
  email_address: string;
  id: string;
};

type UserData = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  image_url?: string | null;
  email_address?: string | null;
  // because Clerk webhook usually send an array of Emails instead of a single email.
  primary_email_address_id?: string | null;
  email_addresses?: ClerkEmailAddress[] | null;
};

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

function getPrimaryEmail(userData: UserData): string | null {
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
  args: { data: v.any() },
  handler: async (ctx, { data }) => {
    const userData = data as UserData;
    const now = Date.now();

    const patch = {
      clerkUserId: userData.id,
      email: getPrimaryEmail(userData),
      firstName: userData.first_name ?? null,
      lastName: userData.last_name ?? null,
      imageUrl: userData.image_url ?? null,
      locale: null,
      updatedAt: now,
    };

    const existUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", userData.id))
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

/**
 * Let the authenticated user update their preferences & defaults.
 */
export const updatePreferences = mutation({
  args: {
    city: v.optional(v.string()),
    preferences: v.optional(
      v.object({
        likedTags: v.array(v.string()),
        dislikedTags: v.array(v.string()),
      }),
    ),
    defaults: v.optional(
      v.object({
        budgetMin: v.optional(v.number()),
        budgetMax: v.optional(v.number()),
        radiusKm: v.optional(v.number()),
        groupType: v.optional(
          v.union(
            v.literal("solo"),
            v.literal("group"),
            v.literal("kids"),
          ),
        ),
        indoorOutdoor: v.optional(
          v.union(
            v.literal("indoor"),
            v.literal("outdoor"),
            v.literal("mixed"),
            v.literal("any"),
          ),
        ),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) =>
        q.eq("clerkUserId", identity.subject),
      )
      .unique();
    if (!user) throw new Error("User not found");

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.city !== undefined) patch.city = args.city;
    if (args.preferences !== undefined) patch.preferences = args.preferences;
    if (args.defaults !== undefined) patch.defaults = args.defaults;

    await ctx.db.patch(user._id, patch);
  },
});
