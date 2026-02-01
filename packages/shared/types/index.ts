/**
 * @plantap/shared - Shared TypeScript Types
 *
 * This file exports shared types used across the PlanTap monorepo.
 * Add your shared types here as the project grows.
 */

// ============================================
// User Types
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: Date;
}

// ============================================
// Schedule Types
// ============================================

export interface ScheduleItem {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  color?: string;
}

export interface WeekSchedule {
  weekStart: Date;
  items: ScheduleItem[];
}

// ============================================
// Common Utility Types
// ============================================

export type Language = "ar" | "en";

export type ThemeMode = "light" | "dark" | "system";

 