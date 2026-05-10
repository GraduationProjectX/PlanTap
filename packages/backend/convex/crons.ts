// File: packages/backend/convex/crons.ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Schedule the Harvester to run exactly twice a day (e.g., 12:00 AM and 12:00 PM)
crons.cron(
  "Harvest Google Places automatically",
  "0 0,12 * * *", // This cron syntax means "Minute 0 of Hour 0 and Hour 12"
  internal.googleplaces.fetchAndSync,
  {}
);

export default crons;