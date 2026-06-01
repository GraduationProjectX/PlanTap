import { ConvexError } from "convex/values";

import type { MutationCtx, QueryCtx } from "../_generated/server";

type AuthContext = Pick<QueryCtx, "auth" | "db"> | Pick<MutationCtx, "auth" | "db">;
type DbContext = Pick<QueryCtx, "db"> | Pick<MutationCtx, "db">;

export async function getUserByClerkId(ctx: DbContext, clerkUserId: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_clerkuserid", (q) => q.eq("clerkUserId", clerkUserId))
    .unique();
}

export async function requireIdentity(ctx: AuthContext) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Not authenticated");
  }

  return identity;
}

export async function getOptionalCurrentUser(ctx: AuthContext) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  return await getUserByClerkId(ctx, identity.subject);
}

export async function requireCurrentUser(ctx: AuthContext) {
  const user = await getOptionalCurrentUser(ctx);
  if (!user) {
    throw new ConvexError("User not found");
  }

  return user;
}
