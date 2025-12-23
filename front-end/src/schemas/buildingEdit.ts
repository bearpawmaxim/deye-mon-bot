import * as v from 'valibot';
import { objectIdSchema } from './base';

export const buildingEditSchema = v.object({
  id: v.nullish(
    objectIdSchema,
  ),
  name: v.pipe(
    v.string(),
    v.minLength(1, 'validation.nameRequired'),
  ),
  color: v.pipe(
    v.string(),
    v.minLength(1, 'validation.colorRequired'),
  ),
  stationId: v.nullable(
    v.pipe(
      objectIdSchema,
      v.nonEmpty('validation.stationRequired'),
      v.transform((x) => x === '0' ? null : x),
    ),
  ),
  reportUserIds: v.pipe(
    v.array(objectIdSchema),
    v.nonEmpty('validation.reportUsersRequired'),
  ),
});

export type BuildingEditType = v.InferInput<typeof buildingEditSchema>;