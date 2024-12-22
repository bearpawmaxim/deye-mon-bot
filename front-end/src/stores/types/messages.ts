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
  shouldSend: boolean;
  timeout: number;
  message: string;
  nextSendTime: Date;
};

export type TemplatePreviewRequest = Omit<BaseServerMessageItem, 'id'|'name'|'lastSentTime'|'enabled'>;

export type MessagesState = BaseEditableState & {
  messages: Array<ServerMessageListItem>;
  editingMessage?: ServerMessageItem;
  templatePreview?: TemplatePreview;
  loadingPreview: boolean;
  changed: boolean;
};

export type SaveMessageResponse = {
  success: boolean;
  id: number;
};

