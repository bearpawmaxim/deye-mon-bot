import { FC, useMemo } from "react";
import { modals } from "@mantine/modals";
import { Button, ColorInput, Group, Loader, parseThemeColor, Select, Stack, TextInput, useMantineColorScheme, useMantineTheme } from "@mantine/core";
import { useFormHandler, useLookup } from "../../../hooks";
import { RootState, useAppDispatch } from "../../../stores/store";
import { buildingEditSchema, BuildingEditType, ObjectId } from "../../../schemas";
import { startEditingBuilding } from "../../../stores/thunks";
import { cancelEditingOrCreatingBuilding, finishCreatingBuilding, finishEditingBuilding, startCreatingBuilding } from "../../../stores/slices";
import { connect } from "react-redux";
import { Controller } from "react-hook-form";
import { LookupSchema } from "../../../types";

type OpenBuildingEditOptions = {
  creating?: boolean;
  buildingId?: ObjectId;
  title?: string;
};

export function openBuildingEditDialog({ creating = false, buildingId, title }: OpenBuildingEditOptions) {
  type InnerProps = {
    building: BuildingEditType;
    loading: boolean;
    buildingId?: ObjectId;
  };

  const mapStateToProps = (state: RootState): InnerProps => ({
    buildingId: buildingId,
    building: state.buildings.editingItem!,
    loading: state.buildings.loading,
  });

  const Inner: FC<InnerProps> = ({ building, loading, buildingId }) => {
    const dispatch = useAppDispatch();

    const theme = useMantineTheme();
    const { colorScheme } = useMantineColorScheme();

    const { data: stations, loading: stationsLoading } = useLookup(LookupSchema.Station);
    const { data: users, loading: usersLoading } = useLookup(LookupSchema.User);
    
    const stationOptions = useMemo(() => stationsLoading ? [] : stations.map(station => ({
      label: station.text,
      value: station.value!.toString(),
    })), [stations, stationsLoading]);
    const userOptions = useMemo(() => usersLoading ? [] : users.map(user => ({
      label: user.text,
      value: user.value!.toString(),
    })), [users, usersLoading])

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
      loading: loading || usersLoading || stationsLoading,
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
          title: "Station",
          render: (context) => {
            return <Controller
              name="stationId"
              control={context.helpers.control}
              defaultValue={'0'}
              render={({ field }) => (
                <Select
                  clearable
                  data={stationOptions}
                  {...field}
                  leftSection={stationsLoading ? <Loader size="xs" /> : null}
                  label={context.title}
                  value={field.value?.toString() ?? ''}
                  error={context.helpers.getFieldError('stationId')}
                />
              )}
            />;
          },
         },
        {
          name: "reportUserId",
          title: "Report User",
          render: (context) => {
            return <Controller
              name="reportUserId"
              control={context.helpers.control}
              defaultValue={'0'}
              render={({ field }) => (
                <Select
                  required
                  allowDeselect={false}
                  data={userOptions}
                  {...field}
                  leftSection={usersLoading ? <Loader size="xs" /> : null}
                  label={context.title}
                  value={field.value?.toString() ?? ''}
                  error={context.helpers.getFieldError('reportUserId')}
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