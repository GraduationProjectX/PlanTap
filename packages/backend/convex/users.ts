import { ConvexError, v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getUserByClerkId, requireIdentity } from "./lib/auth";
import {
  nullableNumber,
  nullableString,
  userFields,
  userGroupTypeValidator,
  userIndoorOutdoorPreferenceValidator,
} from "./schema";

const userValidator = v.object({
  _id: v.id("users"),
  _creationTime: v.number(),
  ...userFields,
});

const completeOnboardingArgsValidator = v.object({
  city: v.optional(nullableString),
  preferences: v.optional(
    v.object({
      likedTags: v.optional(v.array(v.string())),
      dislikedTags: v.optional(v.array(v.string())),
    }),
  ),
  defaults: v.optional(
    v.object({
      groupType: v.optional(userGroupTypeValidator),
      indoorOutdoor: v.optional(userIndoorOutdoorPreferenceValidator),
      budgetMin: v.optional(nullableNumber),
      budgetMax: v.optional(nullableNumber),
    }),
  ),
  notificationsEnabled: v.optional(v.boolean()),
});

function normalizeCity(city: string | null | undefined): string | null {
  if (city == null) {
    return null;
  }

  const normalized = city.trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeTags(tags: string[] | undefined): string[] {
  if (!tags) {
    return [];
  }

  const seen = new Set<string>();
  const normalizedTags: string[] = [];

  for (const rawTag of tags) {
    const normalizedTag = rawTag.trim().toLowerCase();
    if (normalizedTag.length === 0 || seen.has(normalizedTag)) {
      continue;
    }

    seen.add(normalizedTag);
    normalizedTags.push(normalizedTag);
  }

  return normalizedTags;
}

function normalizeBudgetRange(min: number | null, max: number | null) {
  if (min == null || max == null) {
    return { budgetMin: null, budgetMax: null };
  }

  if (min <= max) {
    return { budgetMin: min, budgetMax: max };
  }

  return { budgetMin: max, budgetMax: min };
}

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

export const completeOnboarding = mutation({
  args: completeOnboardingArgsValidator,
  returns: userValidator,
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const now = Date.now();

    const likedTags = normalizeTags(args.preferences?.likedTags);
    const likedTagSet = new Set(likedTags);
    const dislikedTags = normalizeTags(args.preferences?.dislikedTags).filter(
      (tag) => !likedTagSet.has(tag),
    );
    const budgetRange = normalizeBudgetRange(
      args.defaults?.budgetMin ?? null,
      args.defaults?.budgetMax ?? null,
    );

    const patch = {
      city: normalizeCity(args.city),
      preferences: {
        likedTags,
        dislikedTags,
      },
      defaults: {
        groupType: args.defaults?.groupType ?? "group",
        indoorOutdoor: args.defaults?.indoorOutdoor ?? "any",
        budgetMin: budgetRange.budgetMin,
        budgetMax: budgetRange.budgetMax,
      },
      notificationsEnabled: args.notificationsEnabled ?? false,
      onboardingCompletedAt: now,
      updatedAt: now,
    };

    const existingUser = await getUserByClerkId(ctx, identity.subject);
    if (existingUser) {
      await ctx.db.patch(existingUser._id, patch);
      const updatedUser = await ctx.db.get(existingUser._id);
      if (!updatedUser) {
        throw new ConvexError("User not found");
      }

      return updatedUser;
    }

    const insertedUserId = await ctx.db.insert("users", {
      clerkUserId: identity.subject,
      email: null,
      firstName: null,
      lastName: null,
      imageUrl: null,
      locale: null,
      createdAt: now,
      ...patch,
    });
    const insertedUser = await ctx.db.get(insertedUserId);
    if (!insertedUser) {
      throw new ConvexError("User not found");
    }

    return insertedUser;
  },
});
