import { useState, useEffect, FC, useMemo } from 'react';
import { Popover, TextInput, CloseButton, Group } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { DateRange } from '../types';

type InternalDateRange = [Date | string | null, Date | string | null];
type DateRangeOrMacro = InternalDateRange | string;

type DateRangePickerProps = {
  placeholder?: string;
  value?: DateRange | string;
  onChange: (value: DateRange | string) => void;
  clearable?: boolean;
};

const toDayPickerRange = (v?: DateRange): [Date | string | null, Date | string | null] => {
  if (!v) return [null, null];
  const { from, to } = v;
  return [from ?? null, to ?? null];
};

const formatDate = (d: Date | string | null) => {
  if (!d) return '';
  return d instanceof Date ? d.toLocaleDateString() : new Date(d).toLocaleDateString();
};


const DateRangePicker: FC<DateRangePickerProps> = ({
  placeholder = 'Select range',
  value,
  clearable,
  onChange,
}: DateRangePickerProps) => {
  const processValue = (value: DateRange | string | undefined): DateRangeOrMacro => {
    return toDayPickerRange(value as DateRange);
  };

  const [internalValue, setInternalValue] = useState<DateRangeOrMacro>(processValue(value));
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    setTimeout(() => setInternalValue(processValue(value)), 0);
  }, [value]);

  const handleChange = (newValue: InternalDateRange | string) => {
    setInternalValue(newValue);

    if (!newValue[0] && !newValue[1]) {
      onChange({ from: null, to: null });
      return;
    }
    if (!newValue[0] || !newValue[1]) {
      return;
    }

    const [from, to] = newValue as InternalDateRange;
    onChange({
      from: from instanceof Date ? from : new Date(from ?? 0),
      to: to instanceof Date ? to : new Date(to ?? 0),
    });
    setOpened(false);
  };

  const handleClear = () => {
    setInternalValue([null, null]);
    onChange({ from: null, to: null });
  };

  const label = useMemo(() => {
    return internalValue[0] && internalValue[1]
      ? `${formatDate(internalValue[0])} - ${formatDate(internalValue[1])}`
      : '';
  }, [internalValue]);

  return (
    <Popover opened={opened} onChange={setOpened} position="bottom-start" withinPortal shadow="md">
      <Popover.Target>
        <TextInput
          readOnly
          value={label}
          placeholder={placeholder}
          onClick={() => setOpened((o) => !o)}
          rightSection={
            clearable && (internalValue[0] || internalValue[1]) ? (
              <CloseButton onClick={handleClear} />
            ) : undefined
          }
        />
      </Popover.Target>

      <Popover.Dropdown>
        <Group>
          <DatePicker
            type="range"
            allowSingleDateInRange
            value={internalValue as InternalDateRange}
            onChange={handleChange}
          />
        </Group>
      </Popover.Dropdown>
    </Popover>
  );
};

export default DateRangePicker;
