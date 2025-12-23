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
import { usePageTranslation } from "../../../utils";

export const EditableBuildingCard: FC<BuildingCardProps> = ({
  building,
  buildingSummary,
  loadingSummary,
}) => {
  const t = usePageTranslation('dashboard');

  const dispatch = useAppDispatch();
  const onDeleteBuilding = useCallback((building: BuildingListItem) => {
    modals.openConfirmModal({
      title: t('buildings.delete'),
      children: t('buildings.deletePrompt', { name: building.name }),
      labels: { confirm: t('button.confirm'), cancel: t('button.cancel') },
      confirmProps: { color: 'red' },
      onConfirm: () => dispatch(deleteBuilding(building.id!)),
    });
  }, [dispatch, t]);

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
        text={t('buildings.edit')}
        key='btn_edit'
        onClick={() => openBuildingEditDialog({
          creating: false,
          buildingId: building.id!,
          title: `${t('buildings.editDialogTitle', { name: building.name })}`,
        })}
      />
      <IconButton
        icon="trash"
        color="red"
        text={t('buildings.delete')}
        key='btn_delete'
        onClick={() => onDeleteBuilding(building)}
      />
    </Group>
  </Box>
};
