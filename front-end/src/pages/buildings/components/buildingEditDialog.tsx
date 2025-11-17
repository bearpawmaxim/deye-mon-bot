import { FC, useEffect } from "react";
import { modals } from "@mantine/modals";
import { Button, ColorInput, ComboboxItem, Group, parseThemeColor, Select, Stack, TextInput, useMantineColorScheme, useMantineTheme } from "@mantine/core";
import { useFormHandler } from "../../../hooks";
import { RootState, useAppDispatch } from "../../../stores/store";
import { buildingEditSchema, BuildingEditType } from "../../../schemas";
import { startEditingBuilding, fetchStations, fetchUsers } from "../../../stores/thunks";
import { cancelEditingOrCreatingBuilding, finishCreatingBuilding, finishEditingBuilding, startCreatingBuilding } from "../../../stores/slices";
import { connect } from "react-redux";
import { ServerUserItem, StationItem } from "../../../stores/types";
import { createSelector } from "@reduxjs/toolkit";
import { Controller } from "react-hook-form";

type OpenBuildingEditOptions = {
  creating?: boolean;
  buildingId?: number;
  title?: string;
};

export function openBuildingEditDialog({ creating = false, buildingId, title }: OpenBuildingEditOptions) {
  type InnerProps = {
    building: BuildingEditType;
    loading: boolean;
    buildingId?: number;
    users: Array<ComboboxItem>;
    stations: Array<ComboboxItem>;
  };

  const selectUsers = (state: RootState): Array<ServerUserItem> =>
    state.users.users ?? [];

  const selectUserOptions = () => createSelector(
    [selectUsers],
    (users) => users.filter(u => u.isReporter).map((user) => ({
      value: user.id!.toString(),
      label: user.name,
    })),
  );

  const selectStations = (state: RootState): Array<StationItem> =>
    state.stations.stations ?? [];

  const selectStationOptions = () => createSelector(
    [selectStations],
    (stations) => stations.map((station) => ({
      value: station.id!.toString(),
      label: station.stationName,
    })),
  );

  const mapStateToProps = (state: RootState): InnerProps => ({
    buildingId: buildingId,
    building: state.buildings.editingItem!,
    loading: state.buildings.loading,
    users: selectUserOptions()(state),
    stations: selectStationOptions()(state),
  });

  const Inner: FC<InnerProps> = ({ building, loading, stations, users, buildingId }) => {
    const dispatch = useAppDispatch();

    const theme = useMantineTheme();
    const { colorScheme } = useMantineColorScheme();

    useEffect(() => {
      dispatch(fetchUsers());
      dispatch(fetchStations());
    }, [dispatch]);

    const {
      handleFormSubmit,
      handleReset,
      renderField,
      isDirty,
      isValid,
    } = useFormHandler<BuildingEditType>({
      validationSchema: buildingEditSchema,
      fetchDataAction: () => {
        if (!creating) {
          dispatch(startEditingBuilding(buildingId!));
        } else {
          dispatch(startCreatingBuilding());
        }
      },
      saveAction: (data: BuildingEditType) => {
        if (creating) {
          dispatch(finishCreatingBuilding(data));
        } else {
          dispatch(finishEditingBuilding(data));
        }
      },
      cleanupAction: () => {
        dispatch(cancelEditingOrCreatingBuilding());
      },
      formKey: "dashboard-edit-form",
      isEdit: true,
      initialData: building,
      loading: loading,
      useLocationGuard: false,
      defaultRender: (name, title, context) => {
        return <TextInput
          required
          label={title}
          {...context.helpers.registerControl(name)}
        />;
      },
      fields: [
        { name: "name", title: "Building name" },
        {
          name: "color",
          title: "Building color",
          render: (context) => {
            const selectedColor = context.helpers.getControlValue('color');
            let color: string | undefined = undefined;
            if (selectedColor) {    
              color = parseThemeColor({
                color: context.helpers.getControlValue('color'),
                theme,
                colorScheme,
              }).value;
            }
            return <ColorInput
              label={context.title}
              rightSection={loading ? 'Loading...' : null}
              swatches={[
                ...Object.values(theme.colors).flat(),
              ]}
              styles={{
                
              }}
              swatchesPerRow={15}
              {...context.helpers.registerControl('color')}
              value={color}
              onChange={(value) =>
                context.helpers.setControlValue('color', value, true)}
            />

          },
        },
        {
          name: "stationId",
          title: "Station ID",
          render: (context) => {
            return <Controller
              name="stationId"
              control={context.helpers.control}
              defaultValue={0}
              render={({ field }) => (
                <Select
                  required
                  allowDeselect={false}
                  data={stations}
                  {...field}
                  label={context.title}
                  value={field.value?.toString() ?? ''}
                  error={context.helpers.getFieldError('stationId')}
                  onChange={(value) => context.helpers.setControlValue('stationId', parseInt(value!), true, false)}
                />
              )}
            />;
          },
         },
        {
          name: "reportUserId",
          title: "Report User ID",
          render: (context) => {
            return <Controller
              name="reportUserId"
              control={context.helpers.control}
              defaultValue={0}
              render={({ field }) => (
                <Select
                  required
                  allowDeselect={false}
                  data={users}
                  {...field}
                  label={context.title}
                  value={field.value?.toString() ?? ''}
                  error={context.helpers.getFieldError('reportUserId')}
                  onChange={(value) => context.helpers.setControlValue('reportUserId', parseInt(value!), true, false)}
                />
              )}
            />;
          },
        },
      ]
    });
    
    const handleSave = () => {
      if (id) {
        modals.close(id);
      }
      handleFormSubmit();
    };

    const handleCancel = () => {
      if (id) {
        modals.close(id);
      }
      handleReset();
    };

    return (
      <Stack>
        {renderField('name')}
        {renderField('color')}
        {renderField('stationId')}
        {renderField('reportUserId')}
        <Group justify="flex-end">
          <Button
            onClick={handleSave}
            disabled={!isDirty || !isValid}
          >
            Save
          </Button>
          <Button
            variant="default"
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </Group>
      </Stack>
    );
  };

  const ConnectedInner = connect(mapStateToProps)(Inner);
  
  const id: string | undefined = modals.open({
    title: title ?? (creating ? "Create building" : "Edit building"),
    size: 'lg',
    centered: true,
    withCloseButton: false,
    closeOnClickOutside: false,
    closeOnEscape: false,
    children: <ConnectedInner />,
  });
}