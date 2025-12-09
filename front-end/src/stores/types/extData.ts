import { ObjectId } from "../../schemas";
import { BaseState } from "./base";

export type ExtDataItem = {
  id?: number;
  user: string | null;
  user_id?: ObjectId;
  grid_state: boolean;
  received_at: string | null;
};

export type ExtDataState = BaseState & {
  extData: ExtDataItem[];
};

