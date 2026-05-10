import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

export const fetchAndSync = internalAction({
  args: {},
  handler: async (ctx) => {
    const apiKey = process.env.FOURSQUARE_API_KEY?.trim();
    if (!apiKey) throw new Error("Missing FOURSQUARE_API_KEY");

    const city = "Khobar,SA"; 
    const query = "entertainment, cafes, attractions";
    
    const url = `https://places-api.foursquare.com/places/search?near=${encodeURIComponent(city)}&query=${encodeURIComponent(query)}&limit=20`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`, 
        'X-places-api-version': '2025-02-05' 
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Foursquare API failed with status: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    let count = 0;
// mappedevent is very wip, i couldnt get enough info from foursquare
    for (const place of data.results) {
      const mappedEvent = {
        title: place.name,
        titleAr: place.name, 
        descriptionShort: place.location?.formatted_address || "Great local spot.",
        descriptionShortAr: null,
        type: "activity" as const, 
        categories: ["Places"], 
        tags: ["Foursquare Places"], 
        startAt: Date.now(),
        endAt: null,
        city: "Khobar", 
        locationLat: 26.2144, 
        locationLng: 50.1971,
        locationAddress: place.location?.formatted_address || "Unknown Address", 
        locationAddressAr: null,
        priceMin: null,
        priceMax: null,
        indoorOutdoor: "unknown" as const,
        familyFriendly: null,
        images: [], 
        favoritesCount: 0, 
        status: "approved" as const, 
        rating: null,
      };

      await ctx.runMutation(internal.ingest.ingestEvent, { 
        eventData: mappedEvent 
      });
      
      count++;
    }

    return `Successfully synced ${count} places from Foursquare.`;
  },
});