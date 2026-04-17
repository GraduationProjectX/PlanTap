import { type ReactNode } from "react";

type SkeletonScreenTransitionProps = {
  isLoading: boolean;
  skeleton: ReactNode;
  children: ReactNode;
};

export function SkeletonScreenTransition({
  isLoading,
  skeleton,
  children,
}: SkeletonScreenTransitionProps) {
  if (isLoading) {
    return <>{skeleton}</>;
  }

  return <>{children}</>;
}
