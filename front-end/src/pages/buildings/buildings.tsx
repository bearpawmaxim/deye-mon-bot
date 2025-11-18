import { FC, useCallback, useEffect } from "react";
import {
  Container,
  Title,
  Stack,
  Group,
} from "@mantine/core";
import { RootState, useAppDispatch, useAppSelector } from "../../stores/store";
import { fetchBuildings, fetchDashboardConfig, saveBuildings, saveDashboardConfig } from "../../stores/thunks";
import { BuildingsView, openDashboardEditDialog, PlannedOutages } from "./components";
import { BuildingListItem, DashboardConfig } from "../../stores/types";
import { connect } from "react-redux";
import { IconButton } from "../../components";
import { PageHeaderButton, useHeaderContent } from "../../providers";
import { BuildingEditType } from "../../schemas";
import { createSelectEdittedBuildings } from "../../stores/selectors/buildings";

type ComponentProps = {
  loadingConfig: boolean;
  loadingBuildings: boolean;
  dashboardConfig?: DashboardConfig;
  buildings: Array<BuildingListItem | BuildingEditType>;
  configChanged: boolean;
  buildingsChanged: boolean;
};

const mapStateToProps = (state: RootState): ComponentProps => {
  return {
    loadingConfig: state.dashboardConfig.loading,
    configChanged: state.dashboardConfig.changed,
    dashboardConfig: state.dashboardConfig.config,
    loadingBuildings: state.buildings.loading,
    buildingsChanged: state.buildings.changed,
    buildings: createSelectEdittedBuildings(state),
  };
};

const Component: FC<ComponentProps> = ({
  loadingBuildings,
  loadingConfig,
  buildings,
  dashboardConfig,
  configChanged,
  buildingsChanged,
}) => {
  const isAuthenticated = useAppSelector(s => s.auth.token !== null);
  const dispatch = useAppDispatch();

  const fetchData = useCallback(() => {
    dispatch(fetchBuildings());
    dispatch(fetchDashboardConfig());
  }, [dispatch]);

  const saveData = useCallback(() => {
    if (configChanged) {
      dispatch(saveDashboardConfig());
    }
    if (buildingsChanged) {
      dispatch(saveBuildings());
    }
  }, [configChanged, buildingsChanged, dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getHeaderButtons = useCallback((dataChanged: boolean): PageHeaderButton[] => [
    { text: 'Save', icon: "save", color: "green", onClick: saveData, disabled: !dataChanged, },
    { text: 'Cancel', icon: "cancel", color: "black", onClick: fetchData, disabled: !dataChanged, },
  ], [fetchData, saveData]);
  const { setHeaderButtons } = useHeaderContent();
  useEffect(() => {
    setHeaderButtons(getHeaderButtons(configChanged || buildingsChanged));
    return () => setHeaderButtons([]);
  }, [setHeaderButtons, getHeaderButtons, configChanged, buildingsChanged]);

  const onEditDashboardClick = useCallback(() => {
    openDashboardEditDialog({
      dashboardConfig: dashboardConfig ?? {
        title: '',
        enableOutagesSchedule: false,
        outagesScheduleQueue: '',
      },
      title: 'Edit dashboard',
    });
  }, [dashboardConfig]);

  return (
    <>
      <Container size={"xl"} mih='100%'>
        <Stack gap={48} justify="space-between">
          <Group justify="center">
            { !loadingConfig && <Title pt='sm' order={1} ta="center" c="blue">
                {dashboardConfig?.title ?? '<no title set>'}
              </Title> }
            { isAuthenticated && <IconButton
                icon='edit'
                color='blue'
                text='Edit dashboard'
                onClick={onEditDashboardClick}
              /> }
          </Group>

          <BuildingsView
            loading={loadingBuildings}
            isAuthenticated={isAuthenticated}
            buildings={buildings}
          />

          { dashboardConfig?.enableOutagesSchedule && <PlannedOutages
              outageQueue={dashboardConfig.outagesScheduleQueue}
            /> }
        </Stack>
      </Container>
    </>
  );
};

export const BuildingsPage = connect(mapStateToProps)(Component);