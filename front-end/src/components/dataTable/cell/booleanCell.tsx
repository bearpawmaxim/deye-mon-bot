import { Checkbox } from "@mantine/core";

type BooleanCellProps<T> = {
  value: boolean;
  readonly?: boolean;
  row: T;
  checkedChange?: (row: T, state: boolean) => void;
}

export const BooleanCell = <T,>({ value, readonly, row, checkedChange }: BooleanCellProps<T>) => {
  return <Checkbox checked={value} readOnly={readonly} onChange={(e) => checkedChange?.(row, e.currentTarget.checked)} />;
}