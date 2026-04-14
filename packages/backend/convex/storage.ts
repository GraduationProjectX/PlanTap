import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getUser } from "./users";


export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    // auth ;D
    await getUser(ctx);

    //built in function from convex 
    return await ctx.storage.generateUploadUrl();
  },
});

// just fetches images to be used in html or anything else
export const getImageUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});