import { ColumnDataType } from "./columnDataType";

export type PagingConfig = {
  page: number;
  pageSize: number;
};

export type PagingInfo = PagingConfig & {
  total: number;
};

export type PageableRequest = {
  paging: PagingConfig;
};

export type SortingConfig = {
  column: string;
  order: 'asc' | 'desc';
};

export type SortableRequest = {
  sorting: SortingConfig;
};

export type FilterConfig = {
  column: string;
  dataType: ColumnDataType;
  value: unknown;
};

export type FilterableRequest = {
  filters: FilterConfig[];
};

export type PageableResponse<T> = {
  data: T[];
  paging: PagingInfo;
};