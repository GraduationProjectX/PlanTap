import { useMutation, useQuery } from "convex/react";
import { api } from "backend/convex/_generated/api";
import type { Doc, Id } from "backend/convex/_generated/dataModel";

export type BookmarkedEvent = Doc<"events"> & {
  bookmarkId: Id<"bookmarks">;
  bookmarkedAt: number;
};

export function useBookmarks() {
  const data = useQuery(api.bookmarks.listForUser);
  const toggleMutation = useMutation(api.bookmarks.toggle);
  const isLoading = data === undefined;

  const bookmarkedEvents = (data ?? []) as BookmarkedEvent[];
  const bookmarkedIds = new Set(bookmarkedEvents.map((e) => e._id as string));

  const toggleBookmark = (eventId: Id<"events">) => {
    void toggleMutation({ eventId });
  };

  return { bookmarkedEvents, bookmarkedIds, toggleBookmark, isLoading };
}
