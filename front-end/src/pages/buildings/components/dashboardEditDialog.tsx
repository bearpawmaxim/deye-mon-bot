import { ChangeEvent, FC, useMemo } from "react";
import { modals } from "@mantine/modals";
import { Button, Group, Select, Stack, Switch, TextInput } from "@mantine/core";
import { useFormHandler } from "../../../hooks";
import { useAppDispatch } from "../../../stores/store";
import {
  cancelEditingDashboardConfig,
  finishEditingDashboardConfig,
  startEditingDashboardConfig,
} from "../../../stores/slices";
import { dashboardEditSchema, DashboardEditType } from "../../../schemas/dashboardEdit";
import { Controller } from "react-hook-form";

type OpenDashboardEditOptions = {
  dashboardConfig: DashboardEditType;
  title?: string;
};

export function openDashboardEditDialog({ dashboardConfig, title }: OpenDashboardEditOptions) {
  
  const Inner: FC = () => {
    const dispatch = useAppDispatch();

    const outageScheduleQueueOptions = useMemo(() => ([
      { value: '', label: 'No queue' },
      { value: '1.1', label: '1.1' },
      { value: '1.2', label: '1.2' },
      { value: '2.1', label: '2.1' },
      { value: '2.2', label: '2.2' },
      { value: '3.1', label: '3.1' },
      { value: '3.2', label: '3.2' },
      { value: '4.1', label: '4.1' },
      { value: '4.2', label: '4.2' },
      { value: '5.1', label: '5.1' },
      { value: '5.2', label: '5.2' },
      { value: '6.1', label: '6.1' },
      { value: '6.2', label: '6.2' },
    ]), []);

    const {
      handleFormSubmit,
      handleReset,
      renderField,
      isDirty,
      isValid,
    } = useFormHandler<DashboardEditType>({
      validationSchema: dashboardEditSchema,
      fetchDataAction: () => {
        dispatch(startEditingDashboardConfig());
      },
      saveAction: (data: DashboardEditType) => {
        dispatch(finishEditingDashboardConfig(data));
      },
      cleanupAction: () => {
        dispatch(cancelEditingDashboardConfig());
      },
      formKey: "dashboard-edit-form",
      isEdit: true,
      initialData: dashboardConfig,
      loading: false,
      useLocationGuard: false,
      defaultRender: (name, title, context) => {
        return <TextInput label={title} {...context.helpers.registerControl(name)} />;
      },
      fields: [
        { name: "title", title: "Dashboard Title" },
        {
          name: "enableOutagesSchedule",
          title: "Enable Outage schedule",
          render: (context) => {
            const cbProps = {
              ...context.helpers.registerControl('enableOutagesSchedule'),
              onChange: (e: ChangeEvent<HTMLInputElement>) =>
                context.helpers.setControlValue('enableOutagesSchedule', e.target.checked, true),
              checked: context.helpers.getControlValue('enableOutagesSchedule') as boolean ?? false,
            };
            return <Switch
              pb="xs"
              label={context.title}
              {...cbProps}
            />;
          },
         },
        {
          name: "outagesScheduleQueue",
          title: "Outage Schedule Queue",
          render: (context) => {
            return <Controller
            name="outagesScheduleQueue"
            control={context.helpers.control}
            defaultValue={'0'}
            render={({ field }) => (
              <Select
                required
                data={outageScheduleQueueOptions}
                {...field}
                label={context.title}
                value={field.value?.toString() ?? ''}
                error={context.helpers.getFieldError('outagesScheduleQueue')}
                onChange={(value) => context.helpers.setControlValue('outagesScheduleQueue', value!, true, false)}
              />
            )}
          />;
          }
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
        {renderField('title')}
        {renderField('enableOutagesSchedule')}
        {renderField('outagesScheduleQueue')}
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
  
  const id: string | undefined = modals.open({
    title: title ?? "Edit dashboard",
    centered: true,
    withCloseButton: false,
    closeOnClickOutside: false,
    closeOnEscape: false,
    children: <Inner />,
  });
}