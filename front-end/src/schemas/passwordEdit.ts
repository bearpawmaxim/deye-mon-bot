import * as v from 'valibot';


export const passwordEditSchema = v.pipe(
  v.object({
    newPassword: v.pipe(
      v.string(),
      v.minLength(6, 'validation.password.toShort'),
      v.maxLength(30, 'validation.password.toLong'),
      v.regex(/[a-z]/, 'validation.password.needLowerCase'),
      v.regex(/[A-Z]/, 'validation.password.needUpperCase'),
      v.regex(/[0-9]/, 'validation.password.needDigit'),
      v.regex(/[\W_]/, 'validation.password.needSpecCharacter'),
    ),
    repeatNewPassword: v.string(),
  }),
  v.forward(
    v.partialCheck(
      [['newPassword'], ['repeatNewPassword']],
      (input) => input.newPassword === input.repeatNewPassword,
      'validation.repeatPassword.doNotMatch',
    ),
    ['repeatNewPassword'],
));

export type PasswordEdit = v.InferInput<typeof passwordEditSchema>;
