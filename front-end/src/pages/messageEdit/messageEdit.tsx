import { ChangeEvent, FC, useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useHeaderContent } from "../../providers";
import { RootState, useAppDispatch } from "../../stores/store";
import { editMessage, fetchBots, fetchStations, getChannel, saveMessage } from "../../stores/thunks";
import { createMessage, finishEditingMessage, updateMessage } from "../../stores/slices";
import { BotItem, ServerStationItem } from "../../stores/types";
import { connect } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import { FormPage, FormSubmitButtons } from "../../components";
import { ActionIcon, Badge, ComboboxItem, Divider, Select, SimpleGrid, Switch, Tabs, TextInput, Title, Button } from "@mantine/core";
import { useFormHandler } from "../../hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { messageSchema, MessageType } from "../../schemas";
import { Controller } from "react-hook-form";
import { openMessagePreviewDialog, TemplateEditor } from "./components";

type ComponentOwnProps = {
  isEdit: boolean;
};

type ComponentProps = {
  bots: BotItem[];
  stations: ServerStationItem[];
  message?: MessageType;
  loading: boolean;
  isEdit: boolean;
};

const selectBots = (state: RootState) => state.bots;
const selectMessages = (state: RootState) => state.messages;
const selectStations = (state: RootState) => state.stations;

const selectLoading = createSelector(
  [selectBots, selectMessages, selectStations],
  (bots, messages, stations) => bots.loading || messages.loading || stations.loading
);

const mapStateToProps = (state: RootState, ownProps: ComponentOwnProps): ComponentProps => ({
  bots: state.bots.bots,
  stations: state.stations.stations,
  message: state.messages.editingMessage,
  loading: selectLoading(state),
  isEdit: ownProps.isEdit
});

const Component: FC<ComponentProps> = ({ isEdit, bots, stations, message, loading }: ComponentProps) => {
  const dispatch = useAppDispatch();
  const { messageId } = useParams();
  const messageIdInt = parseInt(messageId!);
  

  const messageRef = useRef(message);
  useEffect(() => {
    messageRef.current = message;
  }, [message]);

  const navigate = useNavigate();
  const editOrCreateMessage = useCallback(
    () => dispatch(isEdit ? editMessage(messageIdInt) : createMessage()),
    [dispatch, isEdit, messageIdInt],
  );

  useEffect(() => {
    dispatch(fetchBots());
    dispatch(fetchStations());
  }, [dispatch]);

  const getBotOptions = (): ComboboxItem[] => (bots ?? []).map((bot, index) => ({
    key: `bot_${index}`,
    value: bot.id?.toString(),
    label: bot.name,
  } as ComboboxItem));

  const getStationOptions = (): ComboboxItem[] => ([
    {
      label: 'All stations',
      value: '0',
    },
    ...(stations ?? []).map((station, index) => ({
      key: `station_${index}`,
      value: station.id.toString(),
      label: station.stationName,
    } as ComboboxItem)),
  ]);

  const handleSave = (data: MessageType) => {
    dispatch(updateMessage(data));
    dispatch(saveMessage())
      .unwrap()
      .then(() => navigate(-1))
  };

  const {
    handleFormSubmit,
    hasFieldError,
    renderField,
    registerFormButtons,
    control,
    trigger,
    getControlValue,
    isValid,
  } = useFormHandler<MessageType>({
    formKey: 'message',
    isEdit: isEdit,
    cleanupAction: () => dispatch(finishEditingMessage()),
    fetchDataAction: editOrCreateMessage,
    saveAction: handleSave,
    validationSchema: messageSchema,
    loading: loading,
    initialData: message,
    fields: [
      {
        name: 'name',
        title: 'Name',
        required: true,
      },
      {
        name: 'enabled',
        title: 'Enabled',
        render: (context) => {
          const cbProps = {
            ...context.helpers.registerControl('enabled'),
            onChange: (e: ChangeEvent<HTMLInputElement>) =>
              context.helpers.setControlValue('enabled', e.target.checked, true),
            checked: context.helpers.getControlValue('enabled') as boolean ?? false,
          };
          return <Switch
            pb="xs"
            label={context.title}
            {...cbProps}
          />;
        }
      },
      {
        name: 'botId',
        title: 'Bot',
        required: true,
        render: (context) => {
          return <Controller
            name="botId"
            control={context.helpers.control}
            defaultValue={0}
            render={({ field }) => (
              <Select
                required
                data={getBotOptions()}
                {...field}
                label={context.title}
                value={field.value?.toString() ?? ''}
                error={context.helpers.getFieldError('botId')}
                onChange={(value) => context.helpers.setControlValue('botId', value!, true, false)}
              />
            )}
          />;
        }
      },
      {
        name: 'stationId',
        title: 'Station',
        required: true,
        render: (context) => {
          return <Controller
            name="stationId"
            control={context.helpers.control}
            defaultValue={0}
            render={({ field }) => (
              <Select
                required
                data={getStationOptions()}
                {...field}
                label={context.title}
                value={field.value?.toString() ?? ''}
                error={context.helpers.getFieldError('stationId')}
                onChange={(value) => context.helpers.setControlValue('stationId', parseInt(value!), true, false)}
              />
            )}
          />;
        }
      },
      {
        name: 'channelId',
        title: "Channel",
        required: true,
        render: (context) => 
          <TextInput
            mt='sm'
            {...context.helpers.registerControl('channelId')}
            label={context.title}
            rightSection={<ActionIcon onClick={() => dispatch(getChannel())}>
                <FontAwesomeIcon icon='search' />
              </ActionIcon>}
          />
      }
    ],
    defaultRender: (name, title, context) =>
      <TextInput {...context.helpers.registerControl(name)} label={title} pb="sm" />,
  });

  const { setHeaderText } = useHeaderContent();
  
  useEffect(() => {
    setHeaderText(`${isEdit ? 'Editing' : 'Creating'} message ${message?.name ?? ''}`);
    return () => setHeaderText('');
  }, [isEdit, message?.name, setHeaderText]);


  const createTemplateTab = useCallback((
      name: 'messageTemplate' | 'timeoutTemplate' | 'shouldSendTemplate',
      title: string,
    ) => {
      return <Tabs.Tab value={name}
        rightSection={
          hasFieldError(name) 
            ? <FontAwesomeIcon icon="exclamation-circle" color="red" /> 
            : null 
        }
      >
        {title}
      </Tabs.Tab>;
    }, [hasFieldError]);

  const createTemplateTabPanel = useCallback((
      name: 'messageTemplate' | 'timeoutTemplate' | 'shouldSendTemplate',
    ) => {
      return <Tabs.Panel value={name}>
        <TemplateEditor name={name} control={control} trigger={trigger} />
      </Tabs.Panel>;
    }, [control, trigger]);

  const tabs = useMemo(
    () => [
      createTemplateTab('shouldSendTemplate', 'Should send template'),
      createTemplateTab('timeoutTemplate', 'Timeout template'),
      createTemplateTab('messageTemplate', 'Message template'),
    ], [createTemplateTab],
  );
  const tabPanels = useMemo(
    () => [
      createTemplateTabPanel('shouldSendTemplate'),
      createTemplateTabPanel('timeoutTemplate'),
      createTemplateTabPanel('messageTemplate'),
    ], [createTemplateTabPanel]
  );

  const onOpenPreview = () => {
    const name = getControlValue('name') as string;
    const stationId = getControlValue('stationId') as number | null;
    const shouldSendTemplate = getControlValue('shouldSendTemplate') as string;
    const timeoutTemplate = getControlValue('timeoutTemplate') as string;
    const messageTemplate = getControlValue('messageTemplate') as string;
    openMessagePreviewDialog({
      name,
      stationId,
      shouldSendTemplate,
      timeoutTemplate,
      messageTemplate,
    });
  };

  return <FormPage loading={loading} >
    <form onSubmit={handleFormSubmit}>
      {renderField('enabled')}
      {renderField('name')}
      <Divider />
      <SimpleGrid cols={{ xs: 1, sm: 2, }} mt='xs' mb='xs'>
        {renderField('botId')}
        {renderField('stationId')}
      </SimpleGrid>
      <Divider />
      {renderField('channelId')}
      <Badge>{message?.channelName ?? ''}</Badge>
      <Divider mt='xs' mb='xs'/>
      <Title order={4}>
        Templates
        <Button ml='md' size="xs" color="orange" onClick={onOpenPreview} disabled={!isValid}>Preview</Button>
      </Title>
      <Tabs defaultValue={`messageTemplate`} mb='xs'>
        <Tabs.List mb='xs'>
          {...tabs}
        </Tabs.List>
        {...tabPanels}
      </Tabs>
      <FormSubmitButtons {...registerFormButtons()} />
    </form>
  </FormPage>;
};

export const MessageEditPage = connect(mapStateToProps)(Component);