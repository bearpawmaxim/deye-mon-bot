export type BaseEditableState = {
  loading: boolean;
  creating: boolean;
  error: string | null;
};

export type BaseSaveDataResponse = {
  success: boolean;
  id: number;
};