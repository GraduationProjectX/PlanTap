import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { EventData } from "./schema";


function determineCategories(vsType: string, title: string): string[] {
  const lowerTitle = title.toLowerCase();
  const lowerType = vsType?.toLowerCase() || "";
  const categories = new Set<string>(); // Using a Set prevents duplicate categories

  if (lowerType.includes("event")) categories.add("Festivals & Events");
  if (lowerType.includes("nature")) categories.add("Nature & Outdoors");
  if (lowerType.includes("culture") || lowerType.includes("history")) categories.add("Culture & History");
  if (lowerType.includes("adventure")) categories.add("Adventure");

  if (lowerTitle.includes("restaurant") || lowerTitle.includes("cafe") || lowerTitle.includes("dining") || lowerTitle.includes("chocolate")) {
    categories.add("Food & Dining");
  }
  if (lowerTitle.includes("beach") || lowerTitle.includes("sea") || lowerTitle.includes("club")) {
    categories.add("Beach & Seaside");
  }
  if (lowerTitle.includes("museum") || lowerTitle.includes("heritage") || lowerTitle.includes("art")) {
    categories.add("Culture & History");
  }
  if (lowerTitle.includes("spa") || lowerTitle.includes("wellness")) {
    categories.add("Wellness & Spa");
  }
  if (lowerTitle.includes("music") || lowerTitle.includes("concert") || lowerTitle.includes("season")) {
    categories.add("Entertainment");
  }
  if (categories.size === 0) {
    categories.add("Attractions");
  }
  return Array.from(categories);
}

type VisitSaudiItem = {
  id: string;
  title?: string;
  destination?: string;
  currentPrice?: string;
  type?: string;
  lat?: number;
  lng?: number;
  image?: { fileReference?: string };
};

type VisitSaudiResponse = {
  results?: VisitSaudiItem[];
};

export const fetchVisitSaudi = internalAction({
  args: {},
  handler: async (ctx): Promise<string> => {
    let offset = 0;
    const limit = 50; 
    const MAX_PAGES = 1; 
    let pagesFetched = 0;
    let totalSynced = 0;
    const eventsData: EventData[] = [];

    console.log("Starting Scraper...");

    while (pagesFetched < MAX_PAGES) {
      console.log(`Fetching Page ${pagesFetched + 1} (Offset: ${offset}) in EN and AR...`);
      const [resEn, resAr] = await Promise.all([
        // using both urls so we can get both arabic and english, simple i didnt know what to do
        fetch(`https://www.visitsaudi.com/bin/api/v1/things-to-do/search?locale=en&sortBy=recentlyAdded&limit=${limit}&offset=${offset}`, { headers: { "User-Agent": "Mozilla/5.0" } }),
        fetch(`https://www.visitsaudi.com/bin/api/v1/things-to-do/search?locale=ar&sortBy=recentlyAdded&limit=${limit}&offset=${offset}`, { headers: { "User-Agent": "Mozilla/5.0" } })
      ]);

      if (!resEn.ok || !resAr.ok) {
        console.error(`API failed on page ${pagesFetched + 1}`);
        break; 
      }

      const dataEn: VisitSaudiResponse = JSON.parse(await resEn.text());
      const dataAr: VisitSaudiResponse = JSON.parse(await resAr.text());
      if (!dataEn.results || dataEn.results.length === 0) {
        console.log("Reached the end of the database!");
        break;
      }

      for (const itemEn of dataEn.results) {
        const slugEn = itemEn.id.split('/').pop(); // arabic didnt work so we had to trim the entire string and take the last part to match cause otherwise it wouldnt find it cause the links are different
        const itemAr = (dataAr.results ?? []).find((ar: any) => ar.id.split('/').pop() === slugEn);
        let parsedPrice = null;
        if (itemEn.currentPrice) {
          const match = itemEn.currentPrice.match(/\d+/); 
          if (match) parsedPrice = parseInt(match[0], 10);
        }

        const smartCategories = determineCategories(itemEn.type || "", itemEn.title || "Unknown Event");
        const mappedEvent = {
          externalSource: "visitsaudi",
          externalId: `vs_${itemEn.id.replace(/\//g, '_')}`,  // for dupes
          title: itemEn.title || "Unknown Event",
          titleAr: itemAr?.title || itemEn.title || "Unknown Event", 
          descriptionShort: `${itemEn.title} in ${itemEn.destination || "Saudi Arabia"}.`,
          descriptionShortAr: itemAr ? `${itemAr.title} في ${itemAr.destination || "السعودية"}.` : null,
          type: "event" as const, 
          categories: smartCategories, 
          tags: [itemEn.type || "Attractions"], 
          startAt: Date.now(), 
          endAt: null,
          city: itemEn.destination || "Eastern Province", 
          locationLat: itemEn.lat || 26.4207, 
          locationLng: itemEn.lng || 50.0888,
          locationAddress: itemEn.destination ? `${itemEn.destination}, Saudi Arabia` : "See map for exact location", 
          locationAddressAr: itemAr?.destination ? `${itemAr.destination}، السعودية` : null,
          priceMin: parsedPrice,
          priceMax: parsedPrice,
          indoorOutdoor: "unknown" as const,
          familyFriendly: null,
          images: itemEn.image?.fileReference ? [`https://www.visitsaudi.com${itemEn.image.fileReference}`] : [], 
          favoritesCount: 0,
          status: "approved" as const,
          rating: null,
        };

        eventsData.push(mappedEvent);

        totalSynced++;
      }

      console.log(`Saved ${dataEn.results.length} dual-language items. Total so far: ${totalSynced}`);

      offset += limit;
      pagesFetched++;
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    await ctx.runMutation(internal.ingest.ingestEvents, { eventsData });

    console.log(`Scraping Complete! Successfully synced ${totalSynced} dual-language items.`);
    return `Scraping Complete! Successfully synced ${totalSynced} items from Visit Saudi.`;
  },
});
