import * as v from 'valibot';

export const loginSchema = v.object({
  userName: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(1, 'validation.userName.required')
  ),
  password: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(1, 'validation.password.required')
  ),    
});

export type LoginType = v.InferInput<typeof loginSchema>;