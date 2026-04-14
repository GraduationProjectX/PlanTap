import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";


async function userFetchHelper(ctx: any){ // added this shit to "simplify" querrying for both current function from clerk and for the getUser ;3
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null

  return await ctx.db
    .query("users")
    .withIndex("by_clerk_user_id", (q: any) => q.eq("clerkUserId", identity.subject))
    .unique();

};

export async function getUser(ctx:any){
  const user = userFetchHelper(ctx);
  
  if (!user){
    throw new Error("Not authorized: you have to log in")
  }
  return user;
}

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

    return await userFetchHelper(ctx);
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
      displayName: userData.first_name || "New User",
      firstName: userData.first_name ?? null,
      lastName: userData.last_name ?? null,
      avatarUrl: userData.image_url ?? null,
      locale: "en",
      updatedAt: now,
    }as any; // i gave up, there is an error if i remove "as any" that would make the patch object error out with a type mismatch, its either this or i remove the patch and just write the changes with a function for each value

    const existUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", userData.id))
      .unique();

    if (existUser) {
      await ctx.db.patch(existUser._id, patch); // here is where id make the changes from patch object to just assigning each value into the updated values ex: instead of passing patch id pass firstName: userData.first_name
      return existUser._id;
    }

    return await ctx.db.insert("users", patch) // removed createdAt since convex adds it
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
