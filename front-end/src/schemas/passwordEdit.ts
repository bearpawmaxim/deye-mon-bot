import * as v from 'valibot';


export const passwordEditSchema = v.pipe(
  v.object({
    newPassword: v.pipe(
      v.string(),
      v.minLength(6, 'validation.password.tooShort'),
      v.maxLength(30, 'validation.password.tooLong'),
      v.regex(/[a-z]/, 'validation.password.mustContainLowercase'),
      v.regex(/[A-Z]/, 'validation.password.mustContainUppercase'),
      v.regex(/[0-9]/, 'validation.password.mustContainNumber'),
      v.regex(/[\W_]/, 'validation.password.mustContainSpecialCharacter'),
    ),
    repeatNewPassword: v.string(),
  }),
  v.forward(
    v.partialCheck(
      [['newPassword'], ['repeatNewPassword']],
      (input) => input.newPassword === input.repeatNewPassword,
      'validation.repeatPassword.doesNotMatch',
    ),
    ['repeatNewPassword'],
));

export type PasswordEdit = v.InferInput<typeof passwordEditSchema>;
