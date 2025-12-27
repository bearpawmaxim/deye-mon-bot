import { Button, Divider, Group, NumberInput } from "@mantine/core";
import { modals } from "@mantine/modals";
import { FC, useState } from "react";
import { TFunction } from "i18next";

type BatteryCapacityEditOptions = {
  batteryCapacity: number;
  onClose: (result: boolean, batteryCapacity: number) => void;
  title?: string;
  t: TFunction;
};

export function openBatteryCapacityEditDialog({
  batteryCapacity,
  onClose,
  title,
  t,
}: BatteryCapacityEditOptions) {
  const Inner: FC = () => {
    const [editingBattCapacity, setBattCapacity] = useState(batteryCapacity);

    const handleSave = () => {
      if (id) {
        modals.close(id);
      }
      onClose(true, editingBattCapacity);
    };

    const handleCancel = () => {
      if (id) {
        modals.close(id);
      }
      onClose(false, batteryCapacity);
    };
    return <>
      <NumberInput
        label={t('batteryEdit.label')}
        data-autofocus
        value={editingBattCapacity}
        onChange={(e) => setBattCapacity(parseFloat(e.toString()))}
      />
      <Divider mt='sm' mb='sm' />
      <Group gap={'sm'} justify='flex-end'>
        <Button variant="default" onClick={handleCancel}>
          {t('button.cancel')}
        </Button>
        <Button onClick={handleSave}>{t('button.save')}</Button>
      </Group>
    </>;
  };

  const id: string | undefined = modals.open({
    title: title ?? (t('batteryEdit.title')),
    centered: true,
    children: <Inner />,
  });
}
