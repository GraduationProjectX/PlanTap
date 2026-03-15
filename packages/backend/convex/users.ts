import { ConvexError, v } from "convex/values";

import { query } from "./_generated/server";
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
