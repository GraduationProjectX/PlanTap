import { ConvexError, v } from "convex/values";

import { query } from "./_generated/server";
import { categoryFields } from "./schema";

const categoryValidator = v.object({
  _id: v.id("categories"),
  _creationTime: v.number(),
  ...categoryFields,
});

const MAX_CATEGORIES = 100;

export const list = query({
  args: {},
  returns: v.array(categoryValidator),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    return await ctx.db.query("categories").withIndex("by_sortorder").take(MAX_CATEGORIES);
  },
});
