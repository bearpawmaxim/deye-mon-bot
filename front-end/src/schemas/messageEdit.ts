import * as v from 'valibot';

export const messageEditSchema = v.object({
  id: v.nullable(
    v.string(),
  ),
  name: v.pipe(
    v.string(),
    v.minLength(1, 'Name is required'),
  ),
  enabled: v.boolean(),
  channelId: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(1, 'Channel is required'),
  ),
  channelName: v.nullish(
    v.string(),
  ),
  messageTemplate: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(1, 'Message template is required'),
  ),
  shouldSendTemplate: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(1, 'Should Send template is required'),
  ),
  timeoutTemplate: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(1, 'Timeout template is required'),
  ),
  stations: v.pipe(
    v.array(
      v.number(),
    ),
    v.minLength(1, 'At least one station should be specified'),
  ),
  botId: v.pipe(
    v.number('Bot is required'),
  ),
});

export type MessageEdit = v.InferInput<typeof messageEditSchema>;