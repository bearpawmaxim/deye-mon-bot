import { Column, RowData } from "@tanstack/table-core";
import { ColumnDataType } from "../../types";
import { MantineColor } from "@mantine/core";
import { IconName } from "@fortawesome/fontawesome-svg-core";
import { ReactNode } from "react";

declare module '@tanstack/react-table' {
  interface ColumnMetaFilterOptions<TData extends RowData, TValue> {
    customFilterCell?: (column: Column<TData, TValue>) => ReactNode;
  }

  interface ColumnMeta<TData extends RowData, TValue, TFilterOpts = ColumnMetaFilterOptions<TData, TValue>> {
    dataType?: ColumnDataType | 'actions';
    textAlign?: 'center' | 'left' | 'right';
    filterOptions?: TFilterOpts;
  }

  interface ActionDefinition<TData extends RowData> {
    text: string;
    color: MantineColor;
    icon?: IconName;
    onlyIcon?: boolean;
    clickHandler: (row: TData) => void;
  }

  interface ActionsColumnMeta<TData extends RowData, TValue>
    extends ColumnMeta<TData, TValue> {
      dataType: 'actions';
      actions?: Array<ActionDefinition<TData>>;
    }

  interface IdColumnMeta<TData extends RowData, TValue>
    extends ColumnMeta<TData, TValue> {
      dataType: ColumnDataType.Id;
    }

  interface NumberColumnMetaFilterOptions<TData extends RowData, TValue> 
    extends ColumnMetaFilterOptions<TData, TValue> {
      min?: number;
      max?: number;
      step?: number;
    }

  interface NumberColumnMeta<TData extends RowData, TValue>
    extends ColumnMeta<TData, TValue, NumberColumnMetaFilterOptions<TData, TValue>> {
      dataType: ColumnDataType.Number;
    }
  
  interface TextColumnMeta<TData extends RowData, TValue>
    extends ColumnMeta<TData, TValue> {
      dataType: ColumnDataType.Text;
    }

  interface DateTimeColumnMeta<TData extends RowData, TValue>
    extends ColumnMeta<TData, TValue, ColumnMetaFilterOptions<TData, TValue>> {
      dataType: ColumnDataType.DateTime;
    }

  interface BooleanColumnMeta<TData extends RowData, TValue>
    extends ColumnMeta<TData, TValue, ColumnMetaFilterOptions<TData, TValue>> {
      dataType: ColumnDataType.Boolean;
      readOnly?: boolean;
      customRender?: boolean;
      checkedChange?: (row: TData, state: boolean) => void;
    }

  type TypedColumnMeta<TData, TValue> = 
    ActionsColumnMeta<TData, TValue> |
    DateTimeColumnMeta<TData, TValue> |
    TextColumnMeta<TData, TValue> |
    NumberColumnMeta<TData, TValue> |
    BooleanColumnMeta<TData, TValue> |
    IdColumnMeta<TData, TValue>;
}

export type DataTableColumnDataType = ColumnDataType | 'actions';

export type ColumnSetting = {
  key: string;
  label: string;
  visible: boolean;
  dataType: DataTableColumnDataType;
};
