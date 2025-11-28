import { MessageType } from "../../schemas";
import { BaseEditableState, BaseResponse } from "./base";

export type BaseServerMessageListItem = {
  id?: number;
  name: string;
  stations: number[];
  lastSentTime: Date;
  enabled: boolean;
};

export type BaseServerMessageItem = BaseServerMessageListItem & {
  channelId: string;
  messageTemplate: string;
  shouldSendTemplate: string;
  timeoutTemplate: string;
  botId: number;
};

type MessageDetailsItem = {
  channelName: string;
  botName: string;
};

export type ServerMessageListItem = BaseServerMessageListItem & MessageDetailsItem & {
  changed: boolean;
};

export type ServerMessageItem = BaseServerMessageItem & MessageDetailsItem;

export type TemplatePreview = {
  shouldSend: boolean;
  timeout: number;
  message: string;
  nextSendTime: Date;
};

export type TemplatePreviewResponse = BaseResponse & TemplatePreview;

export type TemplatePreviewRequest = Omit<BaseServerMessageItem, 'id'|'name'|'lastSentTime'|'enabled'>;

export type MessagesState = BaseEditableState & {
  messages: Array<ServerMessageListItem>;
  editingMessage?: MessageType;
  templatePreview?: TemplatePreview;
  loadingPreview: boolean;
  previewError?: string;
  changed: boolean;
};

export type SaveMessageResponse = {
  success: boolean;
  id: number;
};

