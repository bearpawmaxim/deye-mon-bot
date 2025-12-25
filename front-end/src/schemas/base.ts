import * as v from 'valibot';
import { AVAILABLE_LANGUAGES } from '../i18n';

export const objectIdSchema = v.pipe(
  v.string(),
  v.minLength(24, 'Invalid ObjectId: Must be 24 characters long.'),
  v.maxLength(24, 'Invalid ObjectId: Must be 24 characters long.'),
  v.regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId: Must be a hexadecimal string.')
);

const valueSchema = v.pipe(
  v.string(),
  v.minLength(1, 'validation.localizableValue.required')
);

export const localizableValueSchema = v.strictObject(
  Object.fromEntries(
    AVAILABLE_LANGUAGES.map(lang => [lang, valueSchema])
  )
);

export type ObjectId = v.InferInput<typeof objectIdSchema>;
export type LocalizableValue = v.InferInput<typeof localizableValueSchema>;
