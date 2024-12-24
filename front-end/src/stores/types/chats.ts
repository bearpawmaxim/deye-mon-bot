import { BaseState } from "./base";

type BaseServerChat = {
  id: number;
  chatId: string;
  botId: number;
};

type BaseServerChatListItem = {
  chatName: string;
  botName: string;
};

export type AllowedChatListItem = BaseServerChat & BaseServerChatListItem & {
  approveDate: Date;
};
export type ChatRequestListItem = BaseServerChat & BaseServerChatListItem & {
  requestDate: Date;
};

export type ChatsState = BaseState & {
  allowedChats: AllowedChatListItem[];
  chatRequests: ChatRequestListItem[];
};