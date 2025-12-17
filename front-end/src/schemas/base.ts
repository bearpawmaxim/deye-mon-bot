import * as v from 'valibot';

export const objectIdSchema = v.pipe(
  v.string(),
  v.minLength(24, 'Invalid ObjectId: Must be 24 characters long.'),
  v.maxLength(24, 'Invalid ObjectId: Must be 24 characters long.'),
  v.regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId: Must be a hexadecimal string.')
);

export type ObjectId = v.InferInput<typeof objectIdSchema>;