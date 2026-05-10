import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const SEARCH_MATRIX = [
  "specialty coffee in Olaya Khobar",
  "bakeries in Rakkah Khobar",
  "seafood restaurants on Khobar Corniche",
  "fine dining in Al Muraikabat Dammam",
  "shopping malls in Dhahran",
  "hookah lounges in Aziziyah Khobar",
  "museums and galleries in Eastern Province",
  "amusement parks in Dammam",
  "breakfast spots in Al Dawashir Dammam",
  "burger joints in Doha Al Janubiyah"
];

export const fetchAndSync = internalAction({
  args: {
    customMatrix: v.optional(v.array(v.string())), 
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
    if (!apiKey) throw new Error("Missing GOOGLE_PLACES_API_KEY");

    const url = `https://places.googleapis.com/v1/places:searchText`;
    
    const matrixToRun = args.customMatrix || SEARCH_MATRIX;
    let totalSynced = 0;

   
    for (const query of matrixToRun) {
      console.log(`📡 Fetching matrix item: ${query}`);
      
      let pageToken = "";
      let pagesFetched = 0;
      const MAX_PAGES = 3; 

      //max 60 per query ;D
      while (pagesFetched < MAX_PAGES) {
        const requestBody: any = { textQuery: query };
        if (pageToken) {
          requestBody.pageToken = pageToken;
        }

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.businessStatus,nextPageToken'
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          console.error(`Skipping query "${query}" due to API error: ${response.status}`);
          break; // itll break but loop to another query ;D
        }
        
        const data = await response.json();
        
        if (!data.places || data.places.length === 0) {
          break; 
        }

        for (const place of data.places) {
          if (place.businessStatus === "CLOSED_PERMANENTLY") continue;

          const mappedEvent = {
            externalId: place.id, 
            title: place.displayName?.text || "Unknown Place",
            titleAr: place.displayName?.text || "Unknown Place", 
            descriptionShort: place.formattedAddress || "Great local spot.",
            descriptionShortAr: null,
            type: "activity" as const, 
            categories: ["Places"], 
            tags: ["Google Places"], 
            startAt: Date.now(), 
            endAt: null,
            city: "Khobar", 
            locationLat: place.location?.latitude || 26.2144, 
            locationLng: place.location?.longitude || 50.1971,
            locationAddress: place.formattedAddress || "Unknown Address", 
            locationAddressAr: null,
            priceMin: null,
            priceMax: null,
            indoorOutdoor: "unknown" as const,
            familyFriendly: null,
            images: [], 
            favoritesCount: 0, 
            status: "approved" as const, 
            rating: place.rating || null, 
          };

          await ctx.runMutation(internal.ingest.ingestEvent, { 
            eventData: mappedEvent 
          });
          
          totalSynced++;
        }

        if (data.nextPageToken) {
          pageToken = data.nextPageToken;
          pagesFetched++;
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          break;
        }
      }

      // Pause for 2 seconds before moving to the next completely new query
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    return `Sweep Complete! Successfully synced ${totalSynced} places across ${matrixToRun.length} queries.`;
  },
});