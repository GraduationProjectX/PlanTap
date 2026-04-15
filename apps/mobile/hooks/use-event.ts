import { useQuery } from "convex/react";
import { api } from "backend/convex/_generated/api";
import type { Id } from "backend/convex/_generated/dataModel";

export type EventId = Id<"events">;

export function useEventById(id?: EventId) {
  const event = useQuery(api.events.getById, id ? { id } : "skip");
  const isLoading = id !== undefined && event === undefined;
  const notFound = id === undefined || event === null;

  return { event, isLoading, notFound };
}
