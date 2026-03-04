import { query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("categories").collect();
    return categories.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});
