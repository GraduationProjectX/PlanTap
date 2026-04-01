import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";

import { getUser } from "./users";

export const createPlan = mutation({
    args: {
        title: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await getUser(ctx);
        const planId = await ctx.db.insert("plans", {
            title: args.title,
            userId: user._id,
            time: Date.now(),
            status: "draft",
            stops: [],
            constraintsSnapshot: { tags: [] },
            startLocation: { lat: 0, lng: 0 },
            shareId: Math.random().toString(36).substring(2, 10),
        });
        return planId;
    },
});

export const getPlan = query({
    args: { planId: v.id("plans") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.planId);
    },
});

export const listMyPlans = query({
    handler: async (ctx) => {
        const user = await getUser(ctx);
        return await ctx.db
            .query("plans")
            .withIndex("by_user_Ids", (q) => q.eq("userId", user._id))
            .collect();
    },
});

export const updatePlan = mutation({
    args: {
        planId: v.id("plans"),
        title: v.optional(v.string()),
        status: v.optional(v.union(v.literal("draft"), v.literal("saved"), v.literal("completed"))),
    },
    handler: async (ctx, args) => {
        const user = await getUser(ctx);
        const existingPlan = await ctx.db.get(args.planId);

        if (!existingPlan || existingPlan.userId !== user._id) {
            throw new Error("Plan not found or you don't have permission to update it.");
        }

        const { planId, ...rest } = args;
        await ctx.db.patch(planId, rest);
    },
});

export const deletePlan = mutation({
    args: { planId: v.id("plans") },
    handler: async (ctx, args) => {
        const user = await getUser(ctx);
        const existingPlan = await ctx.db.get(args.planId);

        if (!existingPlan || existingPlan.userId !== user._id) {
            throw new Error("Plan not found or you don't have permission to delete it.");
        }

        await ctx.db.delete(args.planId);
    },
});

export const generateShareId = mutation({
    args: { planId: v.id("plans") },
    handler: async (ctx, args) => {
        const user = await getUser(ctx);
        const existingPlan = await ctx.db.get(args.planId);

        if (!existingPlan || existingPlan.userId !== user._id) {
            throw new Error("Plan not found or you don't have permission to share it.");
        }

        const shareId = Math.random().toString(36).substring(2, 10);
        await ctx.db.patch(args.planId, { shareId });
        return shareId;
    },
});

export const getByShareId = query({
    args: { shareId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("plans")
            .filter((q) => q.eq(q.field("shareId"), args.shareId))
            .unique();
    },
});
