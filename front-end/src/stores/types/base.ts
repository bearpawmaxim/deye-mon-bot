export type BaseState = {
  loading: boolean;
  error: string | null;
};

export type BaseEditableState = BaseState & {
  creating: boolean;
};

export type BaseResponse = {
  success: boolean;
  error?: string;
}

export type BaseSaveDataResponse = BaseResponse & {
  id: number;
};