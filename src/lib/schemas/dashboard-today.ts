import { z } from "zod";

export const dashboardTaskSchema = z.object({
  id: z.string(),
  priority: z.enum(["high", "medium", "low"]),
  count: z.number(),
  href: z.string(),
  action: z.string(),
});

export const dashboardRecentSchema = z.object({
  kind: z.string(),
  id: z.string(),
  label: z.string().nullable().optional(),
  at: z.string().nullable().optional(),
});

export const dashboardTodaySchema = z.object({
  role: z.enum(["butcher", "supplier", "admin"]),
  date: z.string(),
  summary: z.record(z.string(), z.union([z.number(), z.string()])),
  tasks: z.array(dashboardTaskSchema),
  recent: z.array(dashboardRecentSchema),
});

export type DashboardTask = z.infer<typeof dashboardTaskSchema>;
export type DashboardRecent = z.infer<typeof dashboardRecentSchema>;
export type DashboardToday = z.infer<typeof dashboardTodaySchema>;
