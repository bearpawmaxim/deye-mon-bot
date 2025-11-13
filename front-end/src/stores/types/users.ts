import { BaseEditableState } from "./base";

export type BaseServerUserItem = {
  id?: number;
  name: string;
  password?: string;
  isActive: boolean;
  isReporter: boolean;
  apiKey?: string | null;
};

export type ServerUserItem = BaseServerUserItem & {
  id: number;
};

export type UserItem = ServerUserItem & {
  changed: boolean;
};

export type UsersState = BaseEditableState & {
  users: Array<UserItem>;
};

export type GenerateTokenResponse = {
  success: boolean;
  token?: string;
  error?: string;
};

