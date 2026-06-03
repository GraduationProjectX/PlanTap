type CityMetadata = {
  value: string;
  label: string;
  labelAr: string;
  imageUrl: string;
};

const CITY_METADATA: CityMetadata[] = [
  {
    value: "Riyadh",
    label: "Riyadh",
    labelAr: "الرياض",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Riyadh_Skyline.jpg/330px-Riyadh_Skyline.jpg",
  },
  {
    value: "Jeddah",
    label: "Jeddah",
    labelAr: "جدة",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Jeddah_Waterfront_2025_%28cropped%29.jpg/330px-Jeddah_Waterfront_2025_%28cropped%29.jpg",
  },
  {
    value: "Makkah",
    label: "Makkah",
    labelAr: "مكة المكرمة",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Great_Mosque_of_Mecca1.jpg/330px-Great_Mosque_of_Mecca1.jpg",
  },
  {
    value: "Madinah",
    label: "Madinah",
    labelAr: "المدينة المنورة",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Al-Masjid_An-Nabawi_%28Bird%27s_Eye_View%29.jpg/330px-Al-Masjid_An-Nabawi_%28Bird%27s_Eye_View%29.jpg",
  },
  {
    value: "Dammam",
    label: "Dammam",
    labelAr: "الدمام",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/%D9%88%D8%B3%D8%B7_%D8%A7%D9%84%D8%AF%D9%85%D8%A7%D9%85.jpg/330px-%D9%88%D8%B3%D8%B7_%D8%A7%D9%84%D8%AF%D9%85%D8%A7%D9%85.jpg",
  },
  {
    value: "Khobar",
    label: "Khobar",
    labelAr: "الخبر",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Khobar_water_tower.jpg/330px-Khobar_water_tower.jpg",
  },
  {
    value: "Qassim",
    label: "Qassim",
    labelAr: "القصيم",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Buraidah.jpg/330px-Buraidah.jpg",
  },
  {
    value: "Taif",
    label: "Taif",
    labelAr: "الطائف",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/%D8%A7%D9%84%D8%B7%D8%A7%D8%A6%D9%81_%D9%85%D9%86_%D8%AC%D8%A8%D9%84_%D8%A7%D9%84%D9%87%D8%AF%D9%891.jpg/330px-%D8%A7%D9%84%D8%B7%D8%A7%D8%A6%D9%81_%D9%85%D9%86_%D8%AC%D8%A8%D9%84_%D8%A7%D9%84%D9%87%D8%AF%D9%891.jpg",
  },
  {
    value: "Abha",
    label: "Abha",
    labelAr: "أبها",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Abha_city.png/330px-Abha_city.png",
  },
  {
    value: "Tabuk",
    label: "Tabuk",
    labelAr: "تبوك",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/%D8%A7%D9%84%D8%AB%D9%84%D9%88%D8%AC_%D8%AA%D8%BA%D8%B7%D9%8A_%D8%AC%D8%A8%D9%84_%D8%A7%D9%84%D9%84%D9%88%D8%B2_%D9%81%D9%8A_%D8%AA%D8%A8%D9%88%D9%83_2022.jpg/330px-%D8%A7%D9%84%D8%AB%D9%84%D9%88%D8%AC_%D8%AA%D8%BA%D8%B7%D9%8A_%D8%AC%D8%A8%D9%84_%D8%A7%D9%84%D9%84%D9%88%D8%B2_%D9%81%D9%8A_%D8%AA%D8%A8%D9%88%D9%83_2022.jpg",
  },
  {
    value: "Hail",
    label: "Hail",
    labelAr: "حائل",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/%D8%AD%D8%A7%D8%A6%D9%84_-_panoramio.jpg/330px-%D8%AD%D8%A7%D8%A6%D9%84_-_panoramio.jpg",
  },
  {
    value: "Jazan",
    label: "Jazan",
    labelAr: "جازان",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Jizan.jpg/330px-Jizan.jpg",
  },
  {
    value: "Najran",
    label: "Najran",
    labelAr: "نجران",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/%D9%82%D9%84%D8%B9%D8%A9_%D8%B1%D8%B9%D9%88%D9%85.jpg/330px-%D9%82%D9%84%D8%B9%D8%A9_%D8%B1%D8%B9%D9%88%D9%85.jpg",
  },
  {
    value: "Al Ahsa",
    label: "Al Ahsa",
    labelAr: "الأحساء",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Al-Ahsa_Palm_Oasis_2023.jpg/330px-Al-Ahsa_Palm_Oasis_2023.jpg",
  },
  {
    value: "Al Jubail",
    label: "Al Jubail",
    labelAr: "الجبيل",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/%D9%85%D8%B1%D8%B3%D9%89_%D8%A7%D9%84%D9%82%D9%88%D8%A7%D8%B1%D8%A8_%D8%A8%D8%A7%D9%84%D8%AC%D8%A8%D9%8A%D9%84_%D8%A7%D9%84%D8%B5%D9%86%D8%A7%D8%B9%D9%8A%D8%A9.jpg/330px-%D9%85%D8%B1%D8%B3%D9%89_%D8%A7%D9%84%D9%82%D9%88%D8%A7%D8%B1%D8%A8_%D8%A8%D8%A7%D9%84%D8%AC%D8%A8%D9%8A%D9%84_%D8%A7%D9%84%D8%B5%D9%86%D8%A7%D8%B9%D9%8A%D8%A9.jpg",
  },
  {
    value: "Yanbu",
    label: "Yanbu",
    labelAr: "ينبع",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Yanbu_Beach_1.jpg/330px-Yanbu_Beach_1.jpg",
  },
];

export const SUPPORTED_CITIES = CITY_METADATA.map((city) => city.value);

function getCityMetadata(city: string): CityMetadata | undefined {
  return CITY_METADATA.find((item) => item.value === city);
}

export function getCityLabel(city: string, isArabic: boolean): string {
  const metadata = getCityMetadata(city);
  if (!metadata) {
    return city;
  }

  return isArabic ? metadata.labelAr : metadata.label;
}

export function getCityImage(city: string): string {
  return getCityMetadata(city)?.imageUrl ?? CITY_METADATA[0]?.imageUrl ?? "";
}
