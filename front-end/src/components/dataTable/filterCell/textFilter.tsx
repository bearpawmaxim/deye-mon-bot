import { Column } from "@tanstack/react-table";
import { useDebounce } from "../../../hooks";
import { useState } from "react";
import { TextInput } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type TextFilterProps<T> = {
  column: Column<T, unknown>;
};

export const TextFilter = <T,>({ column }: TextFilterProps<T>) => {
  const [inputValue, setInputValue] = useState<string>(column.getFilterValue() as string ?? '');

  const debouncedOnChange = useDebounce((value: unknown) => {
    column.setFilterValue(value);
  }, 700);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    debouncedOnChange(event.target.value);
  };
  const handleClear = () => {
    setInputValue('');
    column.setFilterValue('');
  };

  return (
    <TextInput
      value={inputValue}
      placeholder={column.columnDef.header as string}
      onChange={handleChange}
      rightSection={
        inputValue
          ? <FontAwesomeIcon icon="close" onClick={handleClear} style={{cursor: 'pointer'}}/>
          : <FontAwesomeIcon icon="filter" />
      }
    >
    </TextInput>
  );
};