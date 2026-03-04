import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserByClerkId } from "./lib/auth";
import { userFields } from "./schema";

const userValidator = v.object({
  _id: v.id("users"),
  _creationTime: v.number(),
  ...userFields,
});

export const current = query({
  args: {},
  returns: v.union(userValidator, v.null()),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    return await getUserByClerkId(ctx, identity.subject);
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
      .withIndex("by_clerkuserid", (q) =>
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
