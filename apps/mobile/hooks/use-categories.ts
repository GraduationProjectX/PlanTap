import { useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "backend/convex/_generated/api";
import type { Doc } from "backend/convex/_generated/dataModel";

import { readCachedData, writeCachedData } from "@/lib/data-cache";
import { STORAGE_KEYS } from "@/storage/keys";

type RawCategoryDoc = Partial<Doc<"categories">> & { id?: string };

export type CategoryDoc = {
  key: string;
  label: string;
  labelAr: string;
  icon: string;
  sortOrder: number;
};

const CATEGORIES_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function normalizeCategory(doc: RawCategoryDoc): CategoryDoc | null {
  const key =
    typeof doc.key === "string" && doc.key.length > 0
      ? doc.key
      : typeof doc.id === "string" && doc.id.length > 0
        ? doc.id
        : null;

  if (!key) {
    return null;
  }

  const label = typeof doc.label === "string" && doc.label.length > 0 ? doc.label : key;
  const labelAr = typeof doc.labelAr === "string" && doc.labelAr.length > 0 ? doc.labelAr : label;

  return {
    key,
    label,
    labelAr,
    icon: typeof doc.icon === "string" && doc.icon.length > 0 ? doc.icon : "circle",
    sortOrder: typeof doc.sortOrder === "number" ? doc.sortOrder : Number.MAX_SAFE_INTEGER,
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
  const liveCategories = rawCategories === undefined ? null : normalizeCategories(rawCategories);

  useEffect(() => {
    if (rawCategories === undefined) {
      return;
    }

    const normalizedCategories = normalizeCategories(rawCategories);
    writeCachedData(STORAGE_KEYS.CATEGORIES_CACHE, normalizedCategories);
    cachedCategoriesRef.current = normalizedCategories;
  }, [rawCategories]);

  const categories = liveCategories ?? cachedCategoriesRef.current ?? [];
  const isLoading = liveCategories === null && cachedCategoriesRef.current === null;
  const isRefreshing = liveCategories === null && cachedCategoriesRef.current !== null;

  return { categories, isLoading, isRefreshing };
}
