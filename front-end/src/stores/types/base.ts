import { ObjectId } from "../../schemas";
import { PagingInfo } from "../../types";

export type BaseState = {
  loading: boolean;
  error: string | null;
};

export type BaseListState<T> = BaseState & {
  items: T[];
};

export type BaseEditableState = BaseState & {
  creating: boolean;
};

export type BaseResponse = {
  success: boolean;
  error?: string;
  detail?: string;
};

export type BaseSaveDataResponse = BaseResponse & {
  id: ObjectId;
};

export type BasePageableState = {
  paging: PagingInfo;
};