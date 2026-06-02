// File: backend/convex/crons.ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.cron(
  "Harvest Google Places automatically",
  "0 0,12 * * *", // twice at 12
  internal.googleplaces.ingestKhobar,
  {},
);

crons.cron(
  "Harvest Visit Saudi automatically",
  "0 1,13 * * *",
  internal.visitsaudi.fetchVisitSaudi,
  {},
);
export default crons;
