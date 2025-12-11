import { ObjectId } from "../../schemas";
import { BaseState } from "./base";

export type ExtDataItem = {
  id?: ObjectId;
  userId?: ObjectId;
  gridState: boolean;
  receivedAt: string | null;
};

export type ExtDataState = BaseState & {
  extData: ExtDataItem[];
};

