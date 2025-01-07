import { BaseEditableState } from "./base";

export type BaseServerBotItem = {
  id?: number;
  token: string;
  enabled: boolean;
  hookEnabled: boolean;
};

export type ServerBotItem = BaseServerBotItem & {
  name?: string;
};

export type BotItem = ServerBotItem & {
  changed: boolean;
};

export type BotsState = BaseEditableState & {
  bots: Array<BotItem>;
};
