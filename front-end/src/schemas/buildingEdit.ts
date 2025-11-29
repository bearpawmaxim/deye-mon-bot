import * as v from 'valibot';

export const buildingEditSchema = v.object({
  id: v.nullish(
    v.number(),
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
      v.number(),
      v.minValue(0, 'Station is required'),
      v.transform((x) => x === 0 ? null : x),
    ),
  ),
  reportUserId: v.pipe(
    v.number(),
    v.minValue(1, 'Report User is required'),
  ),
});

export type BuildingEditType = v.InferInput<typeof buildingEditSchema>;