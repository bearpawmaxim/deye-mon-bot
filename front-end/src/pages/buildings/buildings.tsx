import { FC, useCallback, useEffect } from "react";
import {
  Container,
  Title,
  Stack,
  Group,
} from "@mantine/core";
import { RootState, useAppDispatch, useAppSelector } from "../../stores/store";
import { fetchBuildings, fetchBuildingsSummary, fetchDashboardConfig, fetchOutagesSchedule, saveBuildings, saveDashboardConfig } from "../../stores/thunks";
import { BuildingsView, openDashboardEditDialog, PlannedOutages } from "./components";
import { BuildingListItem, BuildingSummaryItem, DashboardConfig, OutagesScheduleData } from "../../stores/types";
import { connect } from "react-redux";
import { IconButton } from "../../components";
import { PageHeaderButton, useHeaderContent } from "../../providers";
import { BuildingEditType } from "../../schemas";
import { authDataSelector, createSelectEdittedBuildings } from "../../stores/selectors";
import { initGA, trackPageView } from "../../utils/analytics";
import { useLocalizedEffect } from "../../hooks";

type ComponentProps = {
  loadingConfig: boolean;
  loadingBuildings: boolean;
  loadingSummary: boolean;
  loadingOutagesSchedule: boolean;
  dashboardConfig?: DashboardConfig;
  buildings: Array<BuildingListItem | BuildingEditType>;
  buildingsSummary: Array<BuildingSummaryItem>;
  configChanged: boolean;
  buildingsChanged: boolean;
  outagesScheduleError: string | null;
  outagesSchedule: OutagesScheduleData;
  buildngsSummaryError: string | null;
};

const mapStateToProps = (state: RootState): ComponentProps => {
  return {
    loadingConfig: state.dashboardConfig.loading,
    loadingBuildings: state.buildings.loading,
    loadingSummary: state.buildingsSummary.loading,
    loadingOutagesSchedule: state.outagesSchedule.loading,
    configChanged: state.dashboardConfig.changed,
    dashboardConfig: state.dashboardConfig.config,
    buildingsChanged: state.buildings.changed,
    buildings: createSelectEdittedBuildings(state),
    buildingsSummary: state.buildingsSummary.items,
    outagesSchedule: state.outagesSchedule.outagesSchedule,
    outagesScheduleError: state.outagesSchedule.error,
    buildngsSummaryError: state.buildingsSummary.error,
  };
};

const Component: FC<ComponentProps> = ({
  loadingConfig,
  loadingBuildings,
  loadingSummary,
  loadingOutagesSchedule,
  buildings,
  buildingsSummary,
  dashboardConfig,
  configChanged,
  buildingsChanged,
  outagesSchedule,
  outagesScheduleError,
  buildngsSummaryError,
}) => {
  const isAuthenticated = Boolean(useAppSelector(authDataSelector)?.accessToken);
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

  useLocalizedEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchSummary = useCallback(() => {
    if (buildings && buildings.length > 0 && buildingsSummary.length === 0 && !buildngsSummaryError) {
      const buildingIds = buildings.map(m => m.id!);
      dispatch(fetchBuildingsSummary(buildingIds));
    }
  }, [buildings, buildingsSummary.length, buildngsSummaryError, dispatch]);

  useLocalizedEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const fetchOutages = useCallback(
    () => {
      if (dashboardConfig?.enableOutagesSchedule && dashboardConfig?.outagesScheduleQueue) {
        dispatch(fetchOutagesSchedule(dashboardConfig.outagesScheduleQueue));
      }
    },
    [dashboardConfig, dispatch]
  );

  useLocalizedEffect(() => {
    fetchOutages();
  }, [fetchOutages]);

  // Google Analytics
  useEffect(() => {
    initGA();
    trackPageView('/', 'Buildings Dashboard');
  }, []);

  const getHeaderButtons = useCallback((dataChanged: boolean): PageHeaderButton[] => [
    { text: 'Save', icon: "save", color: "green", onClick: saveData, disabled: !dataChanged, },
    { text: 'Cancel', icon: "cancel", color: "black", onClick: fetchData, disabled: !dataChanged, },
  ], [fetchData, saveData]);
  const { setHeaderButtons } = useHeaderContent();
  useLocalizedEffect(() => {
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
            loadingSummary={loadingSummary}
            buildingsSummary={buildingsSummary}
          />

          { dashboardConfig?.enableOutagesSchedule && <PlannedOutages
              outageQueue={dashboardConfig.outagesScheduleQueue}
              data={outagesSchedule}
              loading={loadingOutagesSchedule}
              error={outagesScheduleError}
              onRefresh={fetchOutages}
            /> }
        </Stack>
      </Container>
    </>
  );
};

export const BuildingsPage = connect(mapStateToProps)(Component);