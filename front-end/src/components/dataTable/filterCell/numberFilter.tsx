import { Column, NumberColumnMeta } from "@tanstack/react-table";
import { useDebounce } from "../../../hooks";
import { useMemo, useState } from "react";
import { RangeSlider, RangeSliderValue, TextInput, Popover } from "@mantine/core";
import { NumberRange } from "../../../types";
import { parseNumberRange, formatNumberRange } from "../../../utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type NumberFilterProps<T> = {
  column: Column<T, unknown>;
};

export const NumberFilter = <T,>({ column }: NumberFilterProps<T>) => {
  const meta = column.columnDef.meta as NumberColumnMeta<T, unknown>;
  const filterOptions = meta?.filterOptions;

  const [inputValue, setInputValue] = useState<NumberRange>(
    parseNumberRange((column.getFilterValue() as string) ?? "")
  );
  const [opened, setOpened] = useState(false);

  const debouncedOnChange = useDebounce((value: unknown) => {
    column.setFilterValue(value);
  }, 700);

  const handleChange = (value: RangeSliderValue) => {
    const range = { from: value[0], to: value[1] };
    setInputValue(range);
    debouncedOnChange(formatNumberRange(range));
  };
  const handleClear = () => {
    setInputValue({});
    column.setFilterValue(null);
  };

  const min = filterOptions?.min ?? 0;
  const max = filterOptions?.max ?? 100;
  const marks = useMemo(() => {
    const step = filterOptions?.step ?? 1;
    const alignedMin = Math.ceil(min / step) * step;
    const alignedMax = Math.floor(max / step) * step;
    const mid = Math.round((alignedMin + alignedMax) / 2 / step) * step;
    const uniqueMarks = Array.from(new Set([alignedMin, mid, alignedMax]));
    return uniqueMarks.map(value => ({
      value,
      label: String(value),
    }));
  }, [min, max, filterOptions?.step]);

  const displayValue = inputValue.from != null && inputValue.to != null
      ? `${inputValue.from} - ${inputValue.to}`
      : "";
  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="bottom-start"
      trapFocus={false}
      closeOnEscape
      withinPortal
    >
      <Popover.Target>
        <TextInput
          value={displayValue}
          onFocus={() => setOpened(true)}
          readOnly
          rightSection={
            typeof inputValue.from === 'number' && inputValue.from >= min
              ? <FontAwesomeIcon icon="close" onClick={handleClear} style={{cursor: 'pointer'}}/>
              : <FontAwesomeIcon icon="filter" />
          }
        />
      </Popover.Target>

      <Popover.Dropdown>
        <RangeSlider
          min={min}
          max={max}
          value={[
            inputValue.from ?? min,
            inputValue.to ?? max,
          ]}
          step={filterOptions?.step ?? 1}
          minRange={0}
          marks={marks}
          onChange={handleChange}
          w={300}
          pt='xs'
          pb='lg'
          mb='xs'
        />
      </Popover.Dropdown>
    </Popover>
  );
};
