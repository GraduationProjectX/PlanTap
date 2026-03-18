import { useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "backend/convex/_generated/api";
import type { Doc } from "backend/convex/_generated/dataModel";

import { readCachedData, writeCachedData } from "@/utils/data-cache";
import { STORAGE_KEYS } from "@/storage/keys";

type RawCategoryDoc = Doc<"categories">;

export type CategoryDoc = {
  key: string;
  label: string;
  labelAr: string;
  icon: string;
  sortOrder: number;
};

const CATEGORIES_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function normalizeCategory(doc: RawCategoryDoc): CategoryDoc | null {
  const key = doc.key;

  if (key.length === 0) {
    return null;
  }

  const label = doc.label.length > 0 ? doc.label : key;
  const labelAr = doc.labelAr.length > 0 ? doc.labelAr : label;

  return {
    key,
    label,
    labelAr,
    icon: doc.icon.length > 0 ? doc.icon : "circle",
    sortOrder: doc.sortOrder,
  };
}

function normalizeCategories(rawCategories: RawCategoryDoc[]): CategoryDoc[] {
  const deduped = new Map<string, CategoryDoc>();

  for (const rawCategory of rawCategories) {
    const category = normalizeCategory(rawCategory);
    if (!category) {
      continue;
    }

    const existing = deduped.get(category.key);
    if (!existing || category.sortOrder < existing.sortOrder) {
      deduped.set(category.key, category);
    }
  }

  return [...deduped.values()].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }

    return a.label.localeCompare(b.label);
  });
}

export function useCategories() {
  const cachedCategoriesRef = useRef<CategoryDoc[] | null>(null);
  if (cachedCategoriesRef.current === null) {
    cachedCategoriesRef.current = readCachedData<CategoryDoc[]>(
      STORAGE_KEYS.CATEGORIES_CACHE,
      CATEGORIES_CACHE_TTL_MS,
    );
  }

  const rawCategories: RawCategoryDoc[] | undefined = useQuery(api.categories.categoriesList);
  const normalizedCategories =
    rawCategories === undefined ? undefined : normalizeCategories(rawCategories);

  useEffect(() => {
    if (normalizedCategories === undefined) {
      return;
    }

    writeCachedData(STORAGE_KEYS.CATEGORIES_CACHE, normalizedCategories);
    cachedCategoriesRef.current = normalizedCategories;
  }, [normalizedCategories]);

  const categories = normalizedCategories ?? cachedCategoriesRef.current ?? [];
  const isLoading = normalizedCategories === undefined && cachedCategoriesRef.current === null;
  const isRefreshing = normalizedCategories === undefined && cachedCategoriesRef.current !== null;

  return { categories, isLoading, isRefreshing };
}
