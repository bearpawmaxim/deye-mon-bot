export type BaseServerBotItem = {
  id?: number;
  token: string;
  enabled: boolean;
};

export type ServerBotItem = BaseServerBotItem & {
  name?: string;
};

export type BotItem = ServerBotItem & {
  changed: boolean;
};

export type BotsState = {
  bots: Array<BotItem>;
  loading: boolean;
  creating: boolean;
  error: string | null;
};

export type SaveBotResponse = {
  success: boolean;
  id: number;
}