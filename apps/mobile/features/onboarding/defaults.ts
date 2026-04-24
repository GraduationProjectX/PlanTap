import type {
  OnboardingDraft,
  OnboardingGroupType,
  OnboardingIndoorOutdoor,
  OnboardingStepId,
  OnboardingTagOption,
} from "./types";

export const ONBOARDING_STEPS: OnboardingStepId[] = [
  "intro",
  "city",
  "interests",
  "dislikes",
  "defaults",
  "notifications",
];

export const ONBOARDING_DEFAULT_DRAFT: OnboardingDraft = {
  city: null,
  preferences: {
    likedTags: [],
    dislikedTags: [],
  },
  defaults: {
    groupType: "group",
    indoorOutdoor: "any",
    budgetMin: null,
    budgetMax: null,
  },
  notificationsEnabled: false,
};

export const ONBOARDING_FALLBACK_TAG_OPTIONS: OnboardingTagOption[] = [
  { id: "music", label: "Music" },
  { id: "food", label: "Food" },
  { id: "sports", label: "Sports" },
  { id: "arts", label: "Arts" },
  { id: "adventure", label: "Adventure" },
  { id: "wellness", label: "Wellness" },
  { id: "tech", label: "Tech" },
  { id: "family", label: "Family" },
  { id: "nightlife", label: "Nightlife" },
  { id: "culture", label: "Culture" },
];

export const ONBOARDING_GROUP_TYPE_OPTIONS: Array<{
  value: OnboardingGroupType;
  labelKey: string;
  descriptionKey: string;
}> = [
  {
    value: "solo",
    labelKey: "onboarding.defaults.groupType.options.solo.label",
    descriptionKey: "onboarding.defaults.groupType.options.solo.description",
  },
  {
    value: "group",
    labelKey: "onboarding.defaults.groupType.options.group.label",
    descriptionKey: "onboarding.defaults.groupType.options.group.description",
  },
  {
    value: "kids",
    labelKey: "onboarding.defaults.groupType.options.kids.label",
    descriptionKey: "onboarding.defaults.groupType.options.kids.description",
  },
];

export const ONBOARDING_INDOOR_OUTDOOR_OPTIONS: Array<{
  value: OnboardingIndoorOutdoor;
  labelKey: string;
  descriptionKey: string;
}> = [
  {
    value: "indoor",
    labelKey: "onboarding.defaults.indoorOutdoor.options.indoor.label",
    descriptionKey: "onboarding.defaults.indoorOutdoor.options.indoor.description",
  },
  {
    value: "outdoor",
    labelKey: "onboarding.defaults.indoorOutdoor.options.outdoor.label",
    descriptionKey: "onboarding.defaults.indoorOutdoor.options.outdoor.description",
  },
  {
    value: "any",
    labelKey: "onboarding.defaults.indoorOutdoor.options.any.label",
    descriptionKey: "onboarding.defaults.indoorOutdoor.options.any.description",
  },
];

export const ONBOARDING_BUDGET_MIN = 0;
export const ONBOARDING_BUDGET_MAX = 500;
export const ONBOARDING_BUDGET_STEP = 5;
export const ONBOARDING_BUDGET_DEFAULT_RANGE: [number, number] = [80, 220];
