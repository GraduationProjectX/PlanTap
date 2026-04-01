import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const GRID_SIZE = 0.02; 

function calculateCellId(lat: number, lng: number): string {
  return `${Math.floor(lat / GRID_SIZE)}:${Math.floor(lng / GRID_SIZE)}`;
}


export const getById = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.eventId);
  },
});


export const listHomeFeed = query({
  args: { city: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
      .withIndex("by_city_and_cell", (q) => q.eq("city", args.city))
      .filter((q) => q.eq(q.field("status"), "approved"))
      .order("desc") 
      .take(20);     
  },
});


export const listNearby = query({
  args: { 
    city: v.string(), 
    cellId: v.string() 
  },
  handler: async (ctx, args) => {
   
    return await ctx.db
      .query("events")
      .withIndex("by_city_and_cell", (q) =>
        q.eq("city", args.city).eq("cellId", args.cellId)
      )
      .filter((q) => q.eq(q.field("status"), "approved"))
      .collect();
  },
});

export const search = query({
  args: { 
    city: v.string(),
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.searchTerm) return [];

    const normalizedTerm = args.searchTerm.toLowerCase();

    const cityEvents = await ctx.db
      .query("events")
      .withIndex("by_city_and_cell", (q) => q.eq("city", args.city))
      .filter((q) => q.eq(q.field("status"), "approved"))
      .collect();

    const searchResults = cityEvents.filter((event) => {
      const matchEn = event.title.toLowerCase().includes(normalizedTerm);
      const matchAr = event.titleAr ? event.titleAr.toLowerCase().includes(normalizedTerm) : false;
      
      return matchEn || matchAr; 
    });
    return searchResults;
  },
});

