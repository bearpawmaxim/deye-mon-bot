import { Column } from "@tanstack/react-table";
import { useState } from "react";
import { DateOrDateRange, DateRange } from "../../../types";
import { fromDateRange, toDateRange } from "../../../utils";
import DateRangePicker from "../../dateRangePicker";

type DateFilterProps<T> = {
  column: Column<T, unknown>;
};

export const DateFilter = <T,>({ column }: DateFilterProps<T>) => {
  const getDateRangeValue = (value?: string): DateOrDateRange | string => {
    return toDateRange(value);
  };
  const [inputValue, setInputValue] = useState(getDateRangeValue(column.getFilterValue() as string));

  const handleChange = (value: DateOrDateRange | string) => {
    setInputValue(value);
    const stringValue = fromDateRange(value as DateOrDateRange);
    column.setFilterValue(stringValue);
  };

  return (
    <DateRangePicker
      value={inputValue as DateRange}
      onChange={handleChange}
      placeholder={column.columnDef.header?.toString()}
      clearable
    />
  );
};