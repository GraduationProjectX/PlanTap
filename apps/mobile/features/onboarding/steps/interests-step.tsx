import { TagSelectionStep } from "./tag-selection-step";

import type { OnboardingTagOption } from "../types";

type InterestsStepProps = {
  title: string;
  description: string;
  selectedTags: string[];
  options: OnboardingTagOption[];
  onSelectionChange: (tags: string[]) => void;
};

export function InterestsStep(props: InterestsStepProps) {
  return <TagSelectionStep {...props} />;
}
