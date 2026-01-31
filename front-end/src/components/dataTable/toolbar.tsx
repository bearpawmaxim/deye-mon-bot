import { ActionIcon, Badge, Text, Group, Tooltip, Select } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import { FC, useMemo } from "react";

type PageSizeSelectorOptions = {
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
};

type ToolbarProps = PageSizeSelectorOptions & {
  usePagination: boolean;
  totalRecords: number;
  refresh: () => void;
};

const pageSizes = [10, 25, 50];

const PageSizeSelector: FC<PageSizeSelectorOptions> = ({ pageSize, onPageSizeChange }) => {
  const pageSizeOptions = useMemo(() => pageSizes.map(s => ({
    value: s.toString(),
    label: s.toString(),
  })), []);

  return <Select
    w={70}
    size="xs"
    value={pageSize.toString()}
    data={pageSizeOptions}
    onChange={v => onPageSizeChange(parseInt(v ?? '10'))}
  />;
};

export const Toolbar = ({ usePagination, totalRecords, refresh, pageSize, onPageSizeChange, }: ToolbarProps) => {
  const { t } = useTranslation();

  return (
    <Group gap={5} justify="flex-end" pb="sm" pr="sm">
      {usePagination && <PageSizeSelector pageSize={pageSize} onPageSizeChange={onPageSizeChange}  />}
      <Tooltip
        label={
          <Text fw={500} fz={13}>
            {t('table.refresh')}
          </Text>
        }
      >
        <ActionIcon size="sm" onClick={refresh} radius={"sm"}>
          <FontAwesomeIcon icon='refresh' size="xs" />
        </ActionIcon>
      </Tooltip>
      <Badge h={22}  color={'teal'} radius={"sm"}>
        {t('table.totalRecordsFormat', { totalRecords })}
      </Badge>
    </Group>
  );
}