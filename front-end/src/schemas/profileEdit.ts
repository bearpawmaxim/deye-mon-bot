import * as v from 'valibot';

export const profileEditSchema = v.object({
  userId: v.string(),
  userName: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(5),
    v.regex(/^[A-Za-z0-9]+$/, 'Only latin characters or digits are allowed'),
    v.maxLength(20),
  ),
});

export type ProfileEdit = v.InferInput<typeof profileEditSchema>;

export const withUniqueNameValidation = (userNames: Array<string>) => {
  return v.object({
    ...profileEditSchema.entries,
    ...v.object({
      userName: v.pipe(
        profileEditSchema.entries.userName,
        v.check((macAddress) => !userNames.includes(macAddress), "User name should be unique"),
      ),
    }).entries,
  });
};
