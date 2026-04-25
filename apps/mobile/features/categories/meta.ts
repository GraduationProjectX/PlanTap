import FontAwesome from "@expo/vector-icons/FontAwesome";

import type { OnboardingTagOption } from "@/features/onboarding/types";

const CATEGORY_ICON_NAME_BY_TOKEN: Record<string, React.ComponentProps<typeof FontAwesome>["name"]> = {
  all: "th-large",
  grid: "th-large",
  sports: "futbol-o",
  adventure: "compass",
  entertainment: "film",
  food: "cutlery",
  concerts: "music",
  music: "music",
  arts: "paint-brush",
  tech: "laptop",
  wellness: "heart",
};

export const ONBOARDING_FALLBACK_TAG_OPTIONS: OnboardingTagOption[] = [
  { id: "sports", label: "Sports", icon: "sports" },
  { id: "adventure", label: "Adventure", icon: "adventure" },
  { id: "entertainment", label: "Entertainment", icon: "entertainment" },
  { id: "food", label: "Food", icon: "food" },
  { id: "concerts", label: "Concerts", icon: "music" },
  { id: "arts", label: "Arts", icon: "arts" },
  { id: "tech", label: "Tech", icon: "tech" },
  { id: "wellness", label: "Wellness", icon: "wellness" },
];

export function getCategoryIconName(categoryKey: string, categoryIcon?: string) {
  if (categoryIcon) {
    const iconName = CATEGORY_ICON_NAME_BY_TOKEN[categoryIcon];
    if (iconName) {
      return iconName;
    }
  }

  const iconName = CATEGORY_ICON_NAME_BY_TOKEN[categoryKey];
  if (iconName) {
    return iconName;
  }

  return "circle";
}
