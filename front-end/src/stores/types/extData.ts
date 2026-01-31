import { ObjectId } from "../../schemas";
import { BaseListState, BasePageableState } from "./base";

export type ExtDataItem = {
  id?: ObjectId;
  userId?: ObjectId;
  gridState: boolean;
  receivedAt: string | null;
};

export type ExtDataState = BaseListState<ExtDataItem> & BasePageableState;
