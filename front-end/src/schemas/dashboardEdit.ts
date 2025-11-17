import * as v from 'valibot';

export const dashboardEditSchema = v.union([
  v.object({
    title: v.pipe(
      v.string(),
      v.minLength(1, 'Title is required'),
    ),
    enableOutagesSchedule: v.literal(true),
    outagesScheduleQueue: v.pipe(
      v.string(),
      v.minLength(1, 'Outages schedule queue is required'),
    ),
  }),
  v.object({
    title: v.pipe(
      v.string(),
      v.minLength(1, 'Title is required'),
    ),
    enableOutagesSchedule: v.literal(false),
    outagesScheduleQueue: v.pipe(
      v.string(),
      v.minLength(0),
    ),
  }),
]);

export type DashboardEditType = v.InferInput<typeof dashboardEditSchema>;