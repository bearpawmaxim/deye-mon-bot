import * as v from 'valibot';


export const passwordEditSchema = v.pipe(
  v.object({
    newPassword: v.pipe(
      v.string(),
      v.minLength(6, 'Password is too short'),
      v.maxLength(30, 'Password is too long'),
      v.regex(/[a-z]/, 'Password must contain a lower-case letter'),
      v.regex(/[A-Z]/, 'Password must contain an upper-case letter'),
      v.regex(/[0-9]/, 'Password must contain a digit'),
      v.regex(/[\W_]/, 'Password must contain a special character'),
    ),
    repeatNewPassword: v.string(),
  }),
  v.forward(
    v.partialCheck(
      [['newPassword'], ['repeatNewPassword']],
      (input) => input.newPassword === input.repeatNewPassword,
      'Passwords does not match',
    ),
    ['repeatNewPassword'],
));

export type PasswordEdit = v.InferInput<typeof passwordEditSchema>;
