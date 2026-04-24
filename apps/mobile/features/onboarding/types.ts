export type OnboardingGroupType = "solo" | "group" | "kids";

export type OnboardingIndoorOutdoor = "indoor" | "outdoor" | "any";

export type OnboardingStepId =
  | "intro"
  | "city"
  | "interests"
  | "dislikes"
  | "defaults"
  | "notifications";

export type OnboardingDraft = {
  city: string | null;
  preferences: {
    likedTags: string[];
    dislikedTags: string[];
  };
  defaults: {
    groupType: OnboardingGroupType;
    indoorOutdoor: OnboardingIndoorOutdoor;
    budgetMin: number | null;
    budgetMax: number | null;
  };
  notificationsEnabled: boolean;
};

export type OnboardingTagOption = {
  id: string;
  label: string;
};
