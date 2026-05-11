export type OnboardingGroupType = "solo" | "group" | "kids" | "any";

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
  };
  notificationsEnabled: boolean;
};

export type OnboardingTagOption = {
  id: string;
  label: string;
  icon?: string;
};
