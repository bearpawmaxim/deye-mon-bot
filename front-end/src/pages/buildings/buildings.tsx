import { FC, useEffect } from "react";
import {
  Container,
  Title,
  SimpleGrid,
  Stack,
  LoadingOverlay,
} from "@mantine/core";
import { RootState, useAppDispatch } from "../../stores/store";
import { fetchBuildings } from "../../stores/thunks";
import { BuildingCard, PlannedOutages } from "./components";
import { BuildingListItem, DashboardConfig } from "../../stores/types";
import { fetchDashboardConfig } from "../../stores/thunks/dashboardConfig";
import { connect } from "react-redux";

type ComponentProps = {
  loadingConfig: boolean;
  loadingBuildings: boolean;
  dashboardConfig?: DashboardConfig;
  buildings: Array<BuildingListItem>;
};

const mapStateToProps = (state: RootState): ComponentProps => {
  return {
    loadingConfig: state.dashboardConfig.loading,
    dashboardConfig: state.dashboardConfig.config,
    loadingBuildings: state.buildings.loading,
    buildings: state.buildings.items,
  };
};

const Component: FC<ComponentProps> = ({ loadingBuildings, loadingConfig, buildings, dashboardConfig }) => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(fetchBuildings());
    dispatch(fetchDashboardConfig());
  }, [dispatch]);

  return (
    <>
      <LoadingOverlay visible={loadingBuildings || loadingConfig} />
      <Container size={"xl"} mih='100%'>
        <Stack gap={48} justify="space-between">
          { dashboardConfig?.title && <Title pt='sm' order={1} ta="center" c="blue">
              {dashboardConfig?.title}
            </Title>}

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
            {buildings.map((building, idx) =>
              <BuildingCard key={idx} building={building} />)}
          </SimpleGrid>

          { dashboardConfig?.enableOutagesSchedule && <PlannedOutages 
              outageQueue={dashboardConfig.outagesScheduleQueue}
            /> }
        </Stack>
      </Container>
    </>
  );
};

export const BuildingsPage = connect(mapStateToProps)(Component);