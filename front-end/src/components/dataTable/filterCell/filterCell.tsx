import { ColumnMeta, Header } from "@tanstack/react-table";
import { TextFilter } from "./textFilter";
import { ColumnDataType } from "../../../types";
import { DateFilter } from "./dateFilter";
import { NumberFilter } from "./numberFilter";

type FilterCellProps<T> = {
  header: Header<T, unknown>;
};

export const FilterCell = <T,>({ header }: FilterCellProps<T>) => {
  const columnMetadata = header.column.columnDef.meta as ColumnMeta<T, unknown>;
  if (columnMetadata.filterOptions?.customFilterCell) {
    return columnMetadata.filterOptions?.customFilterCell(header.column);
  }

  const dataType = columnMetadata?.dataType as ColumnDataType ?? ColumnDataType.Text
  return <>
      { dataType === ColumnDataType.Text && <TextFilter column={header.column} /> }
      { dataType === ColumnDataType.DateTime && <DateFilter column={header.column} /> }
      { dataType === ColumnDataType.Number && <NumberFilter column={header.column} /> }
    </>;
}