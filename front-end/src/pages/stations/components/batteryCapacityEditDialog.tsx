import { Button, Divider, Group, NumberInput } from "@mantine/core";
import { modals } from "@mantine/modals";
import { FC, useState } from "react";

type BatteryCapacityEditOptions = {
  batteryCapacity: number;
  onClose: (result: boolean, batteryCapacity: number) => void;
  title?: string;
};

export function openBatteryCapacityEditDialog({
  batteryCapacity,
  onClose,
  title,
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
        label="Battery capacity (in kWh)"
        data-autofocus
        value={editingBattCapacity}
        onChange={(e) => setBattCapacity(parseFloat(e.toString()))}
      />
      <Divider mt='sm' mb='sm' />
      <Group gap={'sm'} justify='flex-end'>
        <Button variant="default" onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </Group>
    </>;
  };

  const id: string | undefined = modals.open({
    title: title ?? ("Edit battery capacity"),
    centered: true,
    children: <Inner />,
  });
}
