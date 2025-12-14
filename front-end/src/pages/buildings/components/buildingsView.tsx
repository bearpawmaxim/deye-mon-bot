import { FC } from "react";
import { BuildingListItem, BuildingSummaryItem } from "../../../stores/types";
import { ActionIcon, Box, Group, Loader, SimpleGrid, Text } from "@mantine/core";
import { openBuildingEditDialog } from "./buildingEditDialog";
import { EditableBuildingCard } from "./editableBuildingCard";
import { BuildingCard } from "./buildingCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { BuildingEditType } from "../../../schemas";

type BuildingsViewProps = {
  loading: boolean;
  loadingSummary: boolean;
  isAuthenticated: boolean;
  buildings: Array<BuildingListItem | BuildingEditType>;
  buildingsSummary: Array<BuildingSummaryItem>;
}

export const BuildingsView: FC<BuildingsViewProps> = ({
  loading,
  loadingSummary,
  isAuthenticated,
  buildings,
  buildingsSummary,
}) => {
  if (loading) {
    return (
      <Box w='100%' ta="center" py="xl">
        <Loader size="lg" />
        <Text mt="md" c="dimmed">
          Loading buildings...
        </Text>
      </Box>
    )
  }

  return <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
    {buildings.map((building, idx) => {
      const buildingSummary = buildingsSummary.find(f => f.id === building.id);
      return isAuthenticated
        ? <EditableBuildingCard
            key={`b_${idx}`}
            building={building as BuildingListItem}
            loadingSummary={loadingSummary}
            buildingSummary={buildingSummary}
          />
        : <BuildingCard
            key={`b_${idx}`}
            building={building as BuildingListItem}
            loadingSummary={loadingSummary}
            buildingSummary={buildingSummary}
          />
      })}

    {isAuthenticated && <Group justify="center" align="center">
      Add new building
      <ActionIcon
        radius="lg"
        size="lg"
        onClick={() =>
          openBuildingEditDialog({
            creating: true,
            title: "Create new building",
          })
        }
      >
        <FontAwesomeIcon icon="plus" size="2x" />
      </ActionIcon>
    </Group>}
  </SimpleGrid>
;
}