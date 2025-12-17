import * as v from 'valibot';
import { objectIdSchema } from './base';

export const buildingEditSchema = v.object({
  id: v.nullish(
    objectIdSchema,
  ),
  name: v.pipe(
    v.string(),
    v.minLength(1, 'Name is required'),
  ),
  color: v.pipe(
    v.string(),
    v.minLength(1, 'Color is required'),
  ),
  stationId: v.nullable(
    v.pipe(
      objectIdSchema,
      v.nonEmpty('Station is required'),
      v.transform((x) => x === '0' ? null : x),
    ),
  ),
  reportUserId: v.pipe(
    objectIdSchema,
    v.nonEmpty('Report User is required'),
  ),
});

export type BuildingEditType = v.InferInput<typeof buildingEditSchema>;