import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";




async function requireAdmin(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_user_id", (q: any) => q.eq("clerkUserId", identity.subject))
    .unique();

  if (!user || user.role !== "admin") {
    throw new Error("You do not have admin privileges.");
  }
  return user._id;
}

const GRID_SIZE = 0.02;
function calculateCellId(lat: number, lng: number): string {
  return `${Math.floor(lat / GRID_SIZE)}:${Math.floor(lng / GRID_SIZE)}`;
}


// ==========================================

export const listPendingEvents = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();
  },
});

export const approveEvent = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.eventId, { status: "approved" });
  },
});

export const rejectEvent = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.eventId, { status: "rejected" });
  },
});

export const createEvent = mutation({
  args: {
    title: v.string(),
    titleAr: v.optional(v.string()),
    type: v.union(v.literal("event"), v.literal("activity")),
    city: v.string(),
    location: v.object({
      lat: v.number(),
      lng: v.number(),
      address: v.optional(v.string()),
      addressAr: v.optional(v.string()),
    }),
    categories: v.array(v.string()),
    tags: v.array(v.string()),
    provider: v.union(
      v.literal("visitsaudi"), 
      v.literal("ticketmaster"), 
      v.literal("eventbrite"), 
      v.literal("places"), 
      v.literal("scraped"), 
      v.literal("manual")
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const cellId = calculateCellId(args.location.lat, args.location.lng);
    
    return await ctx.db.insert("events", {
      title: args.title,
      titleAr: args.titleAr,
      type: args.type,
      city: args.city,
      location: args.location,
      categories: args.categories,
      tags: args.tags,
      provider: args.provider,
      
      cellId: cellId, 
      status: "approved", 
      favoritesCount: 0,
      images: [],
      audit: {},
      updatedAt: Date.now(),
    });
    
  },
});

export const updateEvent = mutation({
  args: {
    eventId: v.id("events"),
    title: v.optional(v.string()),
    status: v.optional(v.string()),
    location: v.optional(v.object({ 
      lat: v.number(), 
      lng: v.number(),
      address: v.optional(v.string()),
      addressAr: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    const patchObject: any = {};
    
    if (args.title !== undefined) patchObject.title = args.title;
    if (args.status !== undefined) patchObject.status = args.status;
    
    if (args.location !== undefined) {
      patchObject.location = args.location;
      patchObject.cellId = calculateCellId(args.location.lat, args.location.lng);
    }

    await ctx.db.patch(args.eventId, patchObject);
  },
});

export const deleteEvent = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.eventId);
  },
});
export const promoteToAdmin = mutation({
  args: {
    clerkUserId: v.string(),
    role: v.optional(v.literal("admin")) 
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const targetedUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .unique()

      if (!targetedUser){
        throw new Error("not authorized: you are not an admin")
      }
      await ctx.db.patch(targetedUser._id, { role: "admin"});
  },
});

export const demoteToAdmin = mutation({
  args: {
    clerkUserId: v.string(),
    role: v.optional(v.literal("admin")) 
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const targetedUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .unique()

      if (!targetedUser){
        throw new Error("not authorized: you are not an admin")
      }
      await ctx.db.patch(targetedUser._id, { role: undefined});
  },
});

export const mergeEvents = mutation({
  args: { 
    primaryEventId: v.id("events"), 
    duplicateEventId: v.id("events") 
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.duplicateEventId);
  },
});


export const bulkImportCSV = action({
  args: { events: v.array(v.any()) }, 
  handler: async (ctx, args) => {
    for (const eventData of args.events) {
      await ctx.runMutation((api as any).admin.createEvent, eventData); // api as any is temp cause im testing 
    }
    return { success: true, imported: args.events.length };
  },
});

// ==========================================


export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("users").collect();
  },
});

export const banUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.userId, { isBanned: true });
  },
});

export const unbanUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.userId, { isBanned: false });
  },
});

// ==========================================

export const listReports = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("reports")
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();
  },
});

export const resolveReport = mutation({
  args: { reportId: v.id("reports") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.reportId, { status: "resolved" });
  },
});


// ==========================================

export const listCities = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("cities").collect();
  },
});

export const upsertCity = mutation({
  args: { 
    name: v.string(), 
    nameAr: v.string(),
    lat: v.number(),
    lng: v.number(),
    active: v.boolean() 
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    
    const existingCity = await ctx.db
      .query("cities")
      .filter((q) => q.eq(q.field("name"), args.name))
      .unique();

    if (existingCity) {
      await ctx.db.patch(existingCity._id, { 
        nameAr: args.nameAr,
        lat: args.lat,
        lng: args.lng,
        active: args.active 
      });
    } else {
      await ctx.db.insert("cities", { 
        name: args.name, 
        nameAr: args.nameAr,
        lat: args.lat,
        lng: args.lng,
        active: args.active 
      });
    }
  },
});

// ==========================================


export const listFeedback = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("feedback")
      .filter((q) => q.eq(q.field("status"), "open"))
      .collect();
  },
});

export const closeFeedback = mutation({
  args: { feedbackId: v.id("feedback") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.feedbackId, { status: "closed" });
  },
});