import { TagSelectionStep } from "./tag-selection-step";

import type { OnboardingTagOption } from "../types";

type DislikesStepProps = {
  title: string;
  description: string;
  selectedTags: string[];
  options: OnboardingTagOption[];
  onSelectionChange: (tags: string[]) => void;
};

export function DislikesStep(props: DislikesStepProps) {
  return <TagSelectionStep {...props} />;
}
