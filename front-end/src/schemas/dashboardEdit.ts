import * as v from 'valibot';
import { localizableValueSchema } from './base';

export const dashboardEditSchema = v.union([
  v.object({
    title: localizableValueSchema,
    enableOutagesSchedule: v.literal(true),
    outagesScheduleQueue: v.pipe(
      v.string(),
      v.minLength(1, 'validation.outagesScheduleQueueRequired'),
    ),
  }),
  v.object({
    title: localizableValueSchema,
    enableOutagesSchedule: v.literal(false),
    outagesScheduleQueue: v.pipe(
      v.string(),
      v.minLength(0),
    ),
  }),
]);

export type DashboardEditType = v.InferInput<typeof dashboardEditSchema>;