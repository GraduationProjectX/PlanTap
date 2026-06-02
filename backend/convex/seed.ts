import { internalMutation, type MutationCtx } from "./_generated/server";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const SEED_LOOKUP_LIMIT = 500;

type SeedEvent = {
  title: string;
  titleAr: string;
  descriptionShort?: string;
  descriptionShortAr?: string;
  type: "event" | "activity";
  categories: string[];
  tags: string[];
  startAt?: number;
  endAt?: number;
  city: string;
  locationLat: number;
  locationLng: number;
  locationAddress?: string;
  locationAddressAr?: string;
  priceMin?: number;
  priceMax?: number;
  indoorOutdoor: "indoor" | "outdoor" | "mixed" | "unknown";
  familyFriendly?: boolean;
  images: string[];
  favoritesCount: number;
  status: "pending" | "approved" | "rejected";
  rating?: number;
};

type SeedUser = {
  clerkUserId: string;
  email: string;
  firstName: string;
  lastName: string;
  imageUrl?: string;
  locale: string;
};

type SeedReview = {
  eventTitle: string;
  userIndex: number;
  rating: 1 | 2 | 3 | 4 | 5;
  body: string;
  hoursAgo: number;
};

function withEventDefaults(event: SeedEvent) {
  return {
    externalSource: null,
    externalId: null,
    descriptionShort: null,
    descriptionShortAr: null,
    startAt: null,
    endAt: null,
    locationAddress: null,
    locationAddressAr: null,
    priceMin: null,
    priceMax: null,
    familyFriendly: null,
    rating: null,
    ...event,
  };
}

function createSeedEvents(now: number) {
  const seedEvents: SeedEvent[] = [
    {
      title: "Summer Jazz Festival",
      titleAr: "مهرجان الجاز الصيفي",
      descriptionShort: "Live jazz performances under the stars at Central Park",
      descriptionShortAr: "عروض جاز حية تحت النجوم في الحديقة المركزية",
      type: "event",
      categories: ["concerts"],
      tags: ["music", "jazz", "live"],
      startAt: now - 2 * HOUR,
      endAt: now + 4 * HOUR,
      city: "Riyadh",
      locationLat: 24.7136,
      locationLng: 46.6753,
      locationAddress: "Central Park • 0.5mi",
      locationAddressAr: "الحديقة المركزية • ٠.٨ كم",
      indoorOutdoor: "outdoor",
      familyFriendly: true,
      images: ["https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600"],
      favoritesCount: 1200,
      status: "approved",
      rating: 4.8,
    },
    {
      title: "Night Market",
      titleAr: "السوق الليلي",
      descriptionShort: "Food, crafts, and entertainment at the downtown night market",
      descriptionShortAr: "طعام وحرف يدوية وترفيه في السوق الليلي",
      type: "event",
      categories: ["food"],
      tags: ["food", "market", "nightlife"],
      startAt: now - 1 * HOUR,
      endAt: now + 3 * HOUR,
      city: "Riyadh",
      locationLat: 24.7006,
      locationLng: 46.6825,
      locationAddress: "Downtown • 1.2mi",
      locationAddressAr: "وسط المدينة • ١.٩ كم",
      indoorOutdoor: "outdoor",
      images: ["https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600"],
      favoritesCount: 890,
      status: "approved",
      rating: 4.5,
    },
    {
      title: "Coldplay World Tour",
      titleAr: "جولة كولدبلاي العالمية",
      descriptionShort: "The legendary band live at King Fahd Stadium",
      descriptionShortAr: "الفرقة الأسطورية على مسرح استاد الملك فهد",
      type: "event",
      categories: ["concerts"],
      tags: ["music", "concert", "international"],
      startAt: now + 12 * DAY,
      endAt: now + 12 * DAY + 4 * HOUR,
      city: "Riyadh",
      locationLat: 24.7141,
      locationLng: 46.6745,
      locationAddress: "King Fahd Stadium",
      locationAddressAr: "استاد الملك فهد",
      priceMin: 120,
      priceMax: 450,
      indoorOutdoor: "outdoor",
      images: ["https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=600"],
      favoritesCount: 3400,
      status: "approved",
    },
    {
      title: "TechCrunch Disrupt",
      titleAr: "تك كرانش ديسربت",
      descriptionShort: "The world's leading tech startup conference",
      descriptionShortAr: "المؤتمر الرائد عالميًا للشركات الناشئة",
      type: "event",
      categories: ["tech"],
      tags: ["tech", "startup", "conference"],
      startAt: now + 5 * DAY,
      endAt: now + 5 * DAY + 8 * HOUR,
      city: "Riyadh",
      locationLat: 24.7253,
      locationLng: 46.651,
      locationAddress: "Convention Center",
      locationAddressAr: "مركز المؤتمرات",
      priceMin: 45,
      priceMax: 200,
      indoorOutdoor: "indoor",
      images: ["https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=600"],
      favoritesCount: 670,
      status: "approved",
    },
    {
      title: "Padel Tournament",
      titleAr: "بطولة البادل",
      descriptionShort: "Amateur padel championship with prizes",
      descriptionShortAr: "بطولة البادل للهواة مع جوائز",
      type: "event",
      categories: ["sports"],
      tags: ["sports", "padel", "tournament"],
      startAt: now + 2 * DAY,
      endAt: now + 2 * DAY + 6 * HOUR,
      city: "Riyadh",
      locationLat: 24.74,
      locationLng: 46.65,
      locationAddress: "Sports Club",
      locationAddressAr: "النادي الرياضي",
      priceMin: 20,
      indoorOutdoor: "indoor",
      familyFriendly: true,
      images: ["https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&h=600"],
      favoritesCount: 230,
      status: "approved",
      rating: 4.6,
    },
    {
      title: "Deep Sea Fishing",
      titleAr: "الصيد في أعماق البحر",
      descriptionShort: "Full-day deep sea fishing experience",
      descriptionShortAr: "تجربة صيد في أعماق البحر ليوم كامل",
      type: "activity",
      categories: ["sports"],
      tags: ["fishing", "outdoor", "adventure"],
      startAt: now + 3 * DAY,
      endAt: now + 3 * DAY + 10 * HOUR,
      city: "Dammam",
      locationLat: 21.5433,
      locationLng: 39.1728,
      locationAddress: "Harbor",
      locationAddressAr: "الميناء",
      indoorOutdoor: "outdoor",
      images: ["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600"],
      favoritesCount: 150,
      status: "approved",
      rating: 4.3,
    },
    {
      title: "Deep Sea Fishing",
      titleAr: "الصيد في أعماق البحر",
      descriptionShort: "Full-day deep sea fishing experience",
      descriptionShortAr: "تجربة صيد في أعماق البحر ليوم كامل",
      type: "activity",
      categories: ["sports"],
      tags: ["fishing", "outdoor", "adventure"],
      startAt: now + 3 * DAY,
      endAt: now + 3 * DAY + 10 * HOUR,
      city: "Dammam",
      locationLat: 21.5433,
      locationLng: 39.1728,
      locationAddress: "Harbor",
      locationAddressAr: "الميناء",
      indoorOutdoor: "outdoor",
      images: ["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600"],
      favoritesCount: 150,
      status: "approved",
      rating: 4.3,
    },
    {
      title: "Deep Sea Fishing",
      titleAr: "الصيد في أعماق البحر",
      descriptionShort: "Full-day deep sea fishing experience",
      descriptionShortAr: "تجربة صيد في أعماق البحر ليوم كامل",
      type: "activity",
      categories: ["sports"],
      tags: ["fishing", "outdoor", "adventure"],
      startAt: now + 3 * DAY,
      endAt: now + 3 * DAY + 10 * HOUR,
      city: "Qassim",
      locationLat: 21.5433,
      locationLng: 39.1728,
      locationAddress: "Harbor",
      locationAddressAr: "الميناء",
      indoorOutdoor: "outdoor",
      images: ["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600"],
      favoritesCount: 150,
      status: "approved",
      rating: 4.3,
    },
    {
      title: "Deep Sea Fishing",
      titleAr: "الصيد في أعماق البحر",
      descriptionShort: "Full-day deep sea fishing experience",
      descriptionShortAr: "تجربة صيد في أعماق البحر ليوم كامل",
      type: "activity",
      categories: ["sports"],
      tags: ["fishing", "outdoor", "adventure"],
      startAt: now + 3 * DAY,
      endAt: now + 3 * DAY + 10 * HOUR,
      city: "Khobar",
      locationLat: 21.5433,
      locationLng: 39.1728,
      locationAddress: "Harbor",
      locationAddressAr: "الميناء",
      indoorOutdoor: "outdoor",
      images: ["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600"],
      favoritesCount: 150,
      status: "approved",
      rating: 4.3,
    },
    {
      title: "Art Exhibition: Modern Saudi",
      titleAr: "معرض فني: السعودية الحديثة",
      descriptionShort: "Contemporary Saudi art from emerging artists",
      descriptionShortAr: "فن سعودي معاصر من فنانين ناشئين",
      type: "event",
      categories: ["arts"],
      tags: ["art", "exhibition", "culture"],
      startAt: now + 1 * DAY,
      endAt: now + 14 * DAY,
      city: "Riyadh",
      locationLat: 24.6877,
      locationLng: 46.6851,
      locationAddress: "National Museum",
      locationAddressAr: "المتحف الوطني",
      indoorOutdoor: "indoor",
      images: ["https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=800&h=600"],
      favoritesCount: 410,
      status: "approved",
      rating: 4.7,
    },
    {
      title: "Desert Safari Adventure",
      titleAr: "مغامرة سفاري الصحراء",
      descriptionShort: "Thrilling dune bashing and desert camping",
      descriptionShortAr: "مغامرة الكثبان الرملية والتخييم في الصحراء",
      type: "activity",
      categories: ["adventure"],
      tags: ["desert", "safari", "adventure"],
      startAt: now + 4 * DAY,
      endAt: now + 4 * DAY + 8 * HOUR,
      city: "Riyadh",
      locationLat: 24.55,
      locationLng: 46.8,
      locationAddress: "Red Sand Dunes",
      locationAddressAr: "الكثبان الحمراء",
      priceMin: 75,
      priceMax: 150,
      indoorOutdoor: "outdoor",
      familyFriendly: true,
      images: ["https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=800&h=600"],
      favoritesCount: 920,
      status: "approved",
      rating: 4.9,
    },
    {
      title: "Comedy Night",
      titleAr: "ليلة كوميدية",
      descriptionShort: "Stand-up comedy showcase with local talent",
      descriptionShortAr: "عرض كوميدي ستاند أب مع مواهب محلية",
      type: "event",
      categories: ["entertainment"],
      tags: ["comedy", "standup", "nightlife"],
      startAt: now + 7 * DAY,
      endAt: now + 7 * DAY + 3 * HOUR,
      city: "Riyadh",
      locationLat: 24.7118,
      locationLng: 46.6742,
      locationAddress: "The Theater",
      locationAddressAr: "المسرح",
      priceMin: 35,
      priceMax: 80,
      indoorOutdoor: "indoor",
      images: ["https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=800&h=600"],
      favoritesCount: 560,
      status: "approved",
    },
    {
      title: "Yoga in the Park",
      titleAr: "يوغا في الحديقة",
      descriptionShort: "Morning yoga session for all levels",
      descriptionShortAr: "جلسة يوغا صباحية لجميع المستويات",
      type: "activity",
      categories: ["wellness"],
      tags: ["yoga", "wellness", "outdoor"],
      startAt: now + 1 * DAY,
      endAt: now + 1 * DAY + 2 * HOUR,
      city: "Riyadh",
      locationLat: 24.73,
      locationLng: 46.67,
      locationAddress: "King Abdullah Park",
      locationAddressAr: "حديقة الملك عبدالله",
      indoorOutdoor: "outdoor",
      familyFriendly: true,
      images: ["https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600"],
      favoritesCount: 340,
      status: "approved",
      rating: 4.4,
    },
    {
      title: "Street Food Fiesta",
      titleAr: "مهرجان طعام الشارع",
      descriptionShort: "Live grills, dessert stalls, and music in Tahlia district",
      descriptionShortAr: "مشاوي وحلويات وموسيقى حية في حي التحلية",
      type: "event",
      categories: ["food"],
      tags: ["food", "festival", "night"],
      startAt: now - 30 * 60 * 1000,
      endAt: now + 5 * HOUR,
      city: "Riyadh",
      locationLat: 24.6945,
      locationLng: 46.6753,
      locationAddress: "Tahlia Walk",
      locationAddressAr: "ممشى التحلية",
      priceMin: 15,
      priceMax: 60,
      indoorOutdoor: "mixed",
      familyFriendly: true,
      images: ["https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&h=600"],
      favoritesCount: 780,
      status: "approved",
      rating: 4.6,
    },
    {
      title: "Esports Arena Finals",
      titleAr: "نهائيات ساحة الرياضات الإلكترونية",
      descriptionShort: "Regional teams compete live with shoutcasters and fan zone",
      descriptionShortAr: "فرق إقليمية تتنافس مباشرة مع منطقة للمشجعين",
      type: "event",
      categories: ["entertainment"],
      tags: ["esports", "gaming", "live"],
      startAt: now - 45 * 60 * 1000,
      endAt: now + 2 * HOUR,
      city: "Riyadh",
      locationLat: 24.7591,
      locationLng: 46.6227,
      locationAddress: "Riyadh Front Expo",
      locationAddressAr: "واجهة الرياض",
      priceMin: 40,
      priceMax: 120,
      indoorOutdoor: "indoor",
      images: ["https://images.unsplash.com/photo-1542751110-97427bbecf20?w=800&h=600"],
      favoritesCount: 1320,
      status: "approved",
      rating: 4.7,
    },
    {
      title: "Sunset Kayak Session",
      titleAr: "جلسة كاياك وقت الغروب",
      descriptionShort: "Guided kayak tour with safety gear included",
      descriptionShortAr: "جولة كاياك بإرشاد كامل مع معدات السلامة",
      type: "activity",
      categories: ["adventure"],
      tags: ["kayak", "water", "outdoor"],
      startAt: now - 1 * HOUR,
      endAt: now + 2 * HOUR,
      city: "Jeddah",
      locationLat: 21.4858,
      locationLng: 39.1925,
      locationAddress: "Jeddah Waterfront",
      locationAddressAr: "واجهة جدة البحرية",
      priceMin: 55,
      priceMax: 95,
      indoorOutdoor: "outdoor",
      familyFriendly: true,
      images: ["https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800&h=600"],
      favoritesCount: 410,
      status: "approved",
      rating: 4.5,
    },
    {
      title: "Open Pottery Workshop",
      titleAr: "ورشة فخار مفتوحة",
      descriptionShort: "Drop-in pottery wheel session with instructors onsite",
      descriptionShortAr: "جلسة فخار مفتوحة مع مدربين في الموقع",
      type: "activity",
      categories: ["arts"],
      tags: ["pottery", "crafts", "creative"],
      startAt: now - 2 * HOUR,
      endAt: now + 3 * HOUR,
      city: "Riyadh",
      locationLat: 24.7201,
      locationLng: 46.6642,
      locationAddress: "Creative Hub",
      locationAddressAr: "مركز الإبداع",
      priceMin: 30,
      priceMax: 80,
      indoorOutdoor: "indoor",
      images: ["https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&h=600"],
      favoritesCount: 295,
      status: "approved",
      rating: 4.4,
    },
    {
      title: "City Cycling Tour",
      titleAr: "جولة دراجات في المدينة",
      descriptionShort: "Weekend group ride across historic districts",
      descriptionShortAr: "جولة جماعية نهاية الأسبوع عبر الأحياء التاريخية",
      type: "activity",
      categories: ["sports"],
      tags: ["cycling", "fitness", "weekend"],
      startAt: now + 2 * DAY,
      endAt: now + 2 * DAY + 3 * HOUR,
      city: "Riyadh",
      locationLat: 24.7029,
      locationLng: 46.6823,
      locationAddress: "Old Town Gate",
      locationAddressAr: "بوابة البلدة القديمة",
      priceMin: 20,
      priceMax: 45,
      indoorOutdoor: "outdoor",
      familyFriendly: true,
      images: ["https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=600"],
      favoritesCount: 360,
      status: "approved",
      rating: 4.2,
    },
    {
      title: "Indie Film Premiere Night",
      titleAr: "ليلة العرض الأول للأفلام المستقلة",
      descriptionShort: "Premieres and director Q-and-A at the cultural cinema",
      descriptionShortAr: "عروض أولى ونقاش مع المخرجين في السينما الثقافية",
      type: "event",
      categories: ["entertainment"],
      tags: ["film", "cinema", "premiere"],
      startAt: now + 9 * DAY,
      endAt: now + 9 * DAY + 4 * HOUR,
      city: "Riyadh",
      locationLat: 24.7337,
      locationLng: 46.6472,
      locationAddress: "Cultural Cinema",
      locationAddressAr: "السينما الثقافية",
      priceMin: 50,
      priceMax: 140,
      indoorOutdoor: "indoor",
      images: ["https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=600"],
      favoritesCount: 620,
      status: "approved",
      rating: 4.6,
    },
  ];

  return seedEvents.map(withEventDefaults);
}

function createSeedUsers() {
  const seedUsers: SeedUser[] = [
    {
      clerkUserId: "seed-user-sarah",
      email: "sarah@example.com",
      firstName: "Sarah",
      lastName: "J.",
      locale: "en",
    },
    {
      clerkUserId: "seed-user-marcus",
      email: "marcus@example.com",
      firstName: "Marcus",
      lastName: "L.",
      locale: "en",
    },
    {
      clerkUserId: "seed-user-elena",
      email: "elena@example.com",
      firstName: "Elena",
      lastName: "K.",
      locale: "en",
    },
    {
      clerkUserId: "seed-user-james",
      email: "james@example.com",
      firstName: "James",
      lastName: "T.",
      locale: "en",
    },
    {
      clerkUserId: "seed-user-amira",
      email: "amira@example.com",
      firstName: "Amira",
      lastName: "R.",
      locale: "en",
    },
    {
      clerkUserId: "seed-user-david",
      email: "david@example.com",
      firstName: "David",
      lastName: "M.",
      locale: "en",
    },
  ];

  return seedUsers.map((user) => ({
    ...user,
    imageUrl: user.imageUrl ?? null,
  }));
}

function createSeedReviews() {
  const seedReviews: SeedReview[] = [
    {
      eventTitle: "Summer Jazz Festival",
      userIndex: 0,
      rating: 5,
      body: "Absolutely incredible atmosphere. The lighting design was next level. Highly recommend catching the live set near the tunnel entrance.",
      hoursAgo: 48,
    },
    {
      eventTitle: "Summer Jazz Festival",
      userIndex: 1,
      rating: 4,
      body: "The art selection was diverse and the sound system was solid. Only docked a star because it got a bit too crowded around midnight.",
      hoursAgo: 96,
    },
    {
      eventTitle: "Summer Jazz Festival",
      userIndex: 2,
      rating: 5,
      body: "Best underground event I've been to this year. The vibe was excellent from start to finish.",
      hoursAgo: 168,
    },
    {
      eventTitle: "Summer Jazz Festival",
      userIndex: 3,
      rating: 5,
      body: "One of the most creative live events I've attended in Riyadh. I would book it again without hesitation.",
      hoursAgo: 192,
    },
    {
      eventTitle: "Summer Jazz Festival",
      userIndex: 4,
      rating: 4,
      body: "Great energy and talented performers. Would love to see more food options next time.",
      hoursAgo: 240,
    },
    {
      eventTitle: "Summer Jazz Festival",
      userIndex: 5,
      rating: 5,
      body: "Went with friends and we all had an amazing time. Already looking forward to the next edition.",
      hoursAgo: 288,
    },
    {
      eventTitle: "Street Food Fiesta",
      userIndex: 0,
      rating: 5,
      body: "The food stalls were well curated and the live music made the whole walk feel alive.",
      hoursAgo: 24,
    },
    {
      eventTitle: "Esports Arena Finals",
      userIndex: 1,
      rating: 4,
      body: "The production value was strong and the fan zone was packed with good side activities.",
      hoursAgo: 18,
    },
    {
      eventTitle: "Sunset Kayak Session",
      userIndex: 2,
      rating: 5,
      body: "The guides were patient, the route was calm, and sunset on the water was worth it.",
      hoursAgo: 12,
    },
  ];

  return seedReviews;
}

function roundAverageRating(total: number, count: number) {
  if (count === 0) {
    return null;
  }

  return Math.round((total / count) * 10) / 10;
}

const seedCategories = [
  { key: "all", label: "All", labelAr: "الكل", icon: "grid", sortOrder: 0 },
  { key: "sports", label: "Sports", labelAr: "رياضة", icon: "sports", sortOrder: 1 },
  { key: "adventure", label: "Adventure", labelAr: "مغامرة", icon: "adventure", sortOrder: 2 },
  {
    key: "entertainment",
    label: "Entertainment",
    labelAr: "ترفيه",
    icon: "entertainment",
    sortOrder: 3,
  },
  { key: "food", label: "Food", labelAr: "طعام", icon: "food", sortOrder: 4 },
  { key: "concerts", label: "Concerts", labelAr: "حفلات", icon: "music", sortOrder: 5 },
  { key: "arts", label: "Arts", labelAr: "فنون", icon: "arts", sortOrder: 6 },
  { key: "tech", label: "Tech", labelAr: "تقنية", icon: "tech", sortOrder: 7 },
  { key: "wellness", label: "Wellness", labelAr: "صحة", icon: "wellness", sortOrder: 8 },
];

async function seedAllData(ctx: MutationCtx) {
  const [existingEvents, existingCategories, existingUsers] = await Promise.all([
    ctx.db.query("events").take(SEED_LOOKUP_LIMIT),
    ctx.db.query("categories").take(SEED_LOOKUP_LIMIT),
    ctx.db.query("users").take(SEED_LOOKUP_LIMIT),
  ]);

  const now = Date.now();
  const events = createSeedEvents(now);
  const users = createSeedUsers();
  const reviews = createSeedReviews();
  const eventIdsByTitle = new Map<string, (typeof existingEvents)[number]["_id"]>();
  let seededEventsCount = 0;
  let seededCategoriesCount = 0;
  let seededUsersCount = 0;
  let seededReviewsCount = 0;

  if (existingEvents.length === 0) {
    for (const event of events) {
      const eventId = await ctx.db.insert("events", event);
      eventIdsByTitle.set(event.title, eventId);
      seededEventsCount += 1;
    }
  } else {
    for (const event of existingEvents) {
      if (!eventIdsByTitle.has(event.title)) {
        eventIdsByTitle.set(event.title, event._id);
      }
    }
  }

  if (existingCategories.length === 0) {
    for (const category of seedCategories) {
      await ctx.db.insert("categories", category);
      seededCategoriesCount += 1;
    }
  }

  const existingUsersByClerkId = new Map(existingUsers.map((user) => [user.clerkUserId, user._id]));
  const userIds: Array<(typeof existingUsers)[number]["_id"]> = [];

  for (const user of users) {
    const existingUserId = existingUsersByClerkId.get(user.clerkUserId);
    if (existingUserId) {
      userIds.push(existingUserId);
      continue;
    }

    userIds.push(
      await ctx.db.insert("users", {
        ...user,
        createdAt: now,
        updatedAt: now,
      }),
    );
    seededUsersCount += 1;
  }

  const availableEventIds = Array.from(eventIdsByTitle.values());
  const touchedEventIds: Array<(typeof availableEventIds)[number]> = [];

  for (const review of reviews) {
    const eventId =
      eventIdsByTitle.get(review.eventTitle) ??
      availableEventIds[review.userIndex % availableEventIds.length];
    const userId = userIds[review.userIndex];

    if (!eventId || !userId) {
      continue;
    }

    const existingReview = await ctx.db
      .query("reviews")
      .withIndex("by_userid_and_eventid", (q) => q.eq("userId", userId).eq("eventId", eventId))
      .first();

    if (!existingReview) {
      const createdAt = now - review.hoursAgo * HOUR;
      await ctx.db.insert("reviews", {
        eventId,
        userId,
        rating: review.rating,
        body: review.body,
        createdAt,
        updatedAt: createdAt,
      });
      seededReviewsCount += 1;
    }

    if (!touchedEventIds.includes(eventId)) {
      touchedEventIds.push(eventId);
    }
  }

  for (const eventId of touchedEventIds) {
    const eventReviews = await ctx.db
      .query("reviews")
      .withIndex("by_eventid_and_createdat", (q) => q.eq("eventId", eventId))
      .take(SEED_LOOKUP_LIMIT);
    const totals = eventReviews.reduce(
      (result, review) => ({
        total: result.total + review.rating,
        count: result.count + 1,
      }),
      { total: 0, count: 0 },
    );
    await ctx.db.patch(eventId, {
      rating: roundAverageRating(totals.total, totals.count),
    });
  }

  console.log(
    `Seeded ${seededEventsCount} events, ${seededCategoriesCount} categories, ${seededUsersCount} users, and ${seededReviewsCount} reviews.`,
  );

  return {
    seeded:
      seededEventsCount > 0 ||
      seededCategoriesCount > 0 ||
      seededUsersCount > 0 ||
      seededReviewsCount > 0,
    events: seededEventsCount,
    categories: seededCategoriesCount,
    users: seededUsersCount,
    reviews: seededReviewsCount,
  };
}

export const seedEvents = internalMutation({
  args: {},
  handler: async (ctx) => await seedAllData(ctx),
});

export const run = internalMutation({
  args: {},
  handler: async (ctx) => await seedAllData(ctx),
});
