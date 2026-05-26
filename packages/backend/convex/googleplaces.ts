import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

function determineGoogleCategories(query: string, title: string, placeTypes: string[]): string[] {
  // Combine everything into a lowercase string for easy scanning
  const lowerTitle = title.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const typeString = placeTypes.join(" ").toLowerCase();
  
  const categories = new Set<string>(); 

  if (
    typeString.includes("restaurant") || 
    typeString.includes("cafe") || 
    typeString.includes("coffee") || 
    typeString.includes("bakery") || 
    typeString.includes("food") ||
    lowerQuery.includes("coffee") ||
    lowerQuery.includes("tea") ||
    lowerQuery.includes("burger") ||
    lowerTitle.includes("كافيه") || 
    lowerTitle.includes("مقهى") || 
    lowerTitle.includes("مطعم") ||
    lowerTitle.includes("مخبز")
  ) {
    categories.add("Food & Dining");
  }


  if (
    typeString.includes("museum") || 
    typeString.includes("art_gallery") || 
    typeString.includes("cultural_center") ||
    lowerQuery.includes("museum") ||
    lowerQuery.includes("gallery") ||
    lowerTitle.includes("متحف") || 
    lowerTitle.includes("معرض")
  ) {
    categories.add("Culture & History");
  }


  if (
    typeString.includes("shopping_mall") || 
    typeString.includes("department_store") || 
    typeString.includes("store") ||
    lowerQuery.includes("mall") ||
    lowerQuery.includes("shopping") ||
    lowerTitle.includes("مول") || 
    lowerTitle.includes("مجمع") ||
    lowerTitle.includes("سوق")
  ) {
    categories.add("Shopping");
  }


  if (
    typeString.includes("amusement_park") || 
    typeString.includes("amusement_center") || 
    typeString.includes("park") || 
    typeString.includes("tourist_attraction") ||
    lowerQuery.includes("park") ||
    lowerTitle.includes("حديقة") || 
    lowerTitle.includes("منتزه") || 
    lowerTitle.includes("ملاهي")
  ) {
    categories.add("Entertainment");
  }


  if (
    lowerQuery.includes("hookah") || 
    lowerQuery.includes("lounge") || 
    lowerTitle.includes("لاونج") || 
    lowerTitle.includes("شيشه")
  ) {
    categories.add("Nightlife & Lounges"); 
  }
  

  if (categories.size === 0) {
    categories.add("Attractions");
  }

  return Array.from(categories);
}

const SEARCH_MATRIX = [
  "specialty coffee",
  "tea shop",
  "bakery",
  "seafood restaurant",
  "fine dining",
  "shopping mall",
  "hookah lounge",
  "museum",
  "art gallery",
  "amusement park",
  "breakfast spot",
  "burger joint",
  "Pizza restaurant",
  "Gift shop"
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
      console.log(`📡 Fetching matrix item (20km radius): ${query}`);
      
      let pageToken = "";
      let pagesFetched = 0;
      const MAX_PAGES = 3; 

      while (pagesFetched < MAX_PAGES) {
        const requestBody: any = { 
          textQuery: query,
          locationBias: {
            circle: {
              center: {
                latitude: 26.3044, 
                longitude: 50.1478 //this is basically putting the circle pin on dharan ish since its the middle city
              },
              radius: 20000.0 // this mf is in meters
            }
          }
        };

        // If we have a page token, we MUST add it to get the next 20 results
        if (pageToken) {
          requestBody.pageToken = pageToken;
        }

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.businessStatus,places.types,places.primaryType,places.primaryTypeDisplayName,nextPageToken'
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          console.error(`Skipping query "${query}" due to API error: ${response.status}`);
          break; 
        }
        
        const data = await response.json();
        
        if (!data.places || data.places.length === 0) {
          break; 
        }

        for (const place of data.places) {
          if (place.businessStatus === "CLOSED_PERMANENTLY") continue;
          let detectedCity = "Eastern Province"; // Fallback
          const addressString = place.formattedAddress?.toLowerCase() || "";

          
          if (
            addressString.includes("khobar") || 
            addressString.includes("alkhobar") || 
            addressString.includes("الخبر")
          ) {
            detectedCity = "Khobar";
          } 
          else if (
            addressString.includes("dammam") || 
            addressString.includes("الدمام")
          ) {
            detectedCity = "Dammam";
          } 
          else if (
            addressString.includes("dhahran") || 
            addressString.includes("الظهران")
          ) {
            detectedCity = "Dhahran";
          }
        const googlePrimaryName = place.primaryTypeDisplayName?.text || place.primaryType || "";

          // 2. Call the smart categorizer engine
          const smartCategories = determineGoogleCategories(
            query, 
            place.displayName?.text || "", 
            place.types || []
          );

          // 3. Create the clean tags array
          const rawTags = [query, googlePrimaryName, ...(place.types || [])];
          const cleanTags = Array.from(new Set(rawTags.filter(t => t !== "")));  

          const mappedEvent = {
            externalId: place.id, 
            title: place.displayName?.text || "Unknown Place",
            titleAr: place.displayName?.text || "Unknown Place", 
            descriptionShort: place.formattedAddress || "Great local spot.",
            descriptionShortAr: null,
            type: "activity" as const, 
            categories: smartCategories, 
            tags: cleanTags, 
            startAt: Date.now(), 
            endAt: null,
            city: "Eastern Province", // fallback lmao
            locationLat: place.location?.latitude || 26.3044, 
            locationLng: place.location?.longitude || 50.1478,
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

// timer for 2 seconds so we dont get banned haha
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    return `Sweep Complete! Successfully synced ${totalSynced} places across ${matrixToRun.length} categories in the tri-city area.`;
  },
});