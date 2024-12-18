import { BaseEditableState } from "./base";

export type BaseServerMessageListItem = {
  id?: number;
  name: string;
  lastSentTime: Date;
  enabled: boolean;
};

export type BaseServerMessageItem = BaseServerMessageListItem & {
  channelId: string;
  messageTemplate: string;
  shouldSendTemplate: string;
  timeoutTemplate: string;
  stationId?: number;
  botId: number;
};

type MessageDetailsItem = {
  channelName: string;
  stationName: string;
  botName: string;
};

export type ServerMessageListItem = BaseServerMessageListItem & MessageDetailsItem;

export type ServerMessageItem = BaseServerMessageItem & MessageDetailsItem;

export type TemplatePreview = {
  shouldSendPreview: string;
  timeoutPreview: string;
  messagePreview: string;
};

export type TemplatePreviewRequest = {
  shouldSendTemplate: string;
  timeoutTemplate: string;
  messageTemplate: string;
};

export type MessagesState = BaseEditableState & {
  messages: Array<ServerMessageListItem>;
  editingMessage?: ServerMessageItem;
  creatingMessage?: ServerMessageItem;
  templatePreview: TemplatePreview;
  changed: boolean;
};

export type SaveMessageResponse = {
  success: boolean;
  id: number;
};

