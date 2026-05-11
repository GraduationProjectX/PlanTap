import type {
  OnboardingDraft,
  OnboardingGroupType,
  OnboardingIndoorOutdoor,
  OnboardingStepId,
} from "./types";

export { ONBOARDING_FALLBACK_TAG_OPTIONS } from "@/features/categories/meta";

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
  },
  notificationsEnabled: false,
};

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
  {
    value: "any",
    labelKey: "onboarding.defaults.groupType.options.any.label",
    descriptionKey: "onboarding.defaults.groupType.options.any.description",
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
