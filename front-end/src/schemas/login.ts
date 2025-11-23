import * as v from 'valibot';

export const loginSchema = v.object({
  userName: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(1, 'Username is required')
  ),
  password: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(1, 'Password is required')
  ),    
});

export type LoginType = v.InferInput<typeof loginSchema>;