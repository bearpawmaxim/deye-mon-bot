import { FC, useCallback } from "react";
import { BuildingCard, BuildingCardProps } from "./buildingCard";
import { Box, Group } from "@mantine/core";
import classes from '../../styles/buildings.module.css';
import { IconButton } from "../../../components";
import { openBuildingEditDialog } from "./buildingEditDialog";
import { useAppDispatch } from "../../../stores/store";
import { modals } from "@mantine/modals";
import { BuildingListItem } from "../../../stores/types";
import { deleteBuilding } from "../../../stores/thunks";

export const EditableBuildingCard: FC<BuildingCardProps> = ({
  building,
  buildingSummary,
  loadingSummary,
}) => {
  const dispatch = useAppDispatch();
  const onDeleteBuilding = useCallback((building: BuildingListItem) => {
    modals.openConfirmModal({
      title: 'Delete Building',
      children: `Are you sure you want to delete building "${building.name}"?`,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => dispatch(deleteBuilding(building.id!)),
    });
  }, [dispatch]);

  return <Box className={classes.buildingCard}>
    <BuildingCard
      building={building}
      buildingSummary={buildingSummary}
      loadingSummary={loadingSummary}
    />
    <Group justify="flex-end" pt='xs' gap='xs' className={classes.buildingCardActions}>
      <IconButton
        icon="edit"
        color="blue"
        text="Edit building"
        key='btn_edit'
        onClick={() => openBuildingEditDialog({
          creating: false,
          buildingId: building.id!,
          title: `Edit building: ${building.name}`,
        })}
      />
      <IconButton
        icon="trash"
        color="red"
        text="Delete building"
        key='btn_delete'
        onClick={() => onDeleteBuilding(building)}
      />
    </Group>
  </Box>
};