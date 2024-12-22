export type BaseEditableState = {
  loading: boolean;
  creating: boolean;
  error: string | null;
};

export type BaseResponse = {
  success: boolean;
  error?: string;
}

export type BaseSaveDataResponse = BaseResponse & {
  id: number;
};