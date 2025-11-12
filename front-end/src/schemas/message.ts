import * as v from 'valibot';

export const messageSchema = v.object({
  id: v.nullable(
    v.number(),
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
  stationId: v.nullable(
    v.pipe(
      v.number(),
      v.minValue(0, 'Station is required'),
      v.transform((x) => x === 0 ? null : x),
    ),
  ),
  botId: v.pipe(
    v.number('Bot is required'),
  ),
});

export type MessageType = v.InferInput<typeof messageSchema>;