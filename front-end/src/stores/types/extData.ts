import { BaseState } from "./base";

export type ExtDataItem = {
  id?: number;
  user: string | null;
  user_id?: number;
  grid_state: boolean;
  received_at: string | null;
};

export type ExtDataState = BaseState & {
  extData: ExtDataItem[];
};

