import { ObjectId } from "../../schemas";
import { BaseEditableState } from "./base";

export type BaseServerBotItem = {
  id?: ObjectId;
  token: string;
  enabled: boolean;
  hookEnabled: boolean;
};

export type ServerBotItem = BaseServerBotItem & {
  name?: string;
};

export type BotItem = ServerBotItem & {
  changed: boolean;
  created: boolean;
};

export type BotsState = BaseEditableState & {
  bots: Array<BotItem>;
};
