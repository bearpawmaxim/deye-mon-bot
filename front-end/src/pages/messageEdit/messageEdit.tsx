import { FC, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeaderButton, useHeaderContent } from "../../providers";
import { RootState, useAppDispatch } from "../../stores/store";
import { editMessage, fetchBots, fetchStations, getChannel, saveMessage } from "../../stores/thunks";
import { createMessage, finishEditingMessage, updateMessage } from "../../stores/slices";
import { BotItem, ServerMessageItem, ServerStationItem } from "../../stores/types";
import { connect } from "react-redux";
import { MessagePreview, TemplateEditor } from "./components";
import { createSelector } from "@reduxjs/toolkit";

type ComponentOwnProps = {
  isEdit: boolean;
};

type ComponentProps = {
  bots: BotItem[];
  stations: ServerStationItem[];
  message?: ServerMessageItem;
  loading: boolean;
  changed: boolean;
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
  changed: state.messages.changed,
  isEdit: ownProps.isEdit
});

const Component: FC<ComponentProps> = ({ isEdit, bots, stations, message, loading, changed }: ComponentProps) => {
  const dispatch = useAppDispatch();
  const { messageId } = useParams();
  const messageIdInt = parseInt(messageId!);
  const [initiallyChanged, setInitiallyChanged] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string | null>>({});
  const hasError = (name: string) => formErrors[name]?.trim() ?? '' !== '';
  const getError = (name: string) => formErrors[name];
  const [previewShown, setPreviewShown] = useState(false);

  const messageRef = useRef(message);
  useEffect(() => {
    messageRef.current = message;
  }, [message]);

  const navigate = useNavigate();
  const editOrCreateMessage = () => dispatch(isEdit ? editMessage(messageIdInt) : createMessage());

  useEffect(() => {
    dispatch(fetchBots());
    dispatch(fetchStations());
    editOrCreateMessage();
    return () => { dispatch(finishEditingMessage()); };
  }, [dispatch]);

  useEffect(() => {
    setHeaderText(`${isEdit ? 'Editing' : 'Creating'} message ${message?.name ?? ''}`);
    return () => setHeaderText('');
  }, [message?.name]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!messageRef?.current) {
      return true;
    }
    Object.entries(messageRef.current as Record<string, any>).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) {
        newErrors[key] = error;
      }
    });
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSaveClick = () => {
    if (validate()) {
      dispatch(saveMessage()).then(() => navigate(-1));
    }
  };

  const { setHeaderButtons, updateButtonAttributes, setHeaderText } = useHeaderContent();
  const getHeaderButtons = (): PageHeaderButton[] => [
    { text: 'Save', icon:'save', color: "green", onClick: onSaveClick.bind(this), disabled: true, },
    { text: 'Cancel', icon: 'cancel', color: "black", onClick: () => editOrCreateMessage(), disabled: true, },
  ];
  useEffect(() => {
    setHeaderButtons(getHeaderButtons());
    return () => setHeaderButtons([]);
  }, [setHeaderButtons]);

  const getBotOptions = (): DropdownItemProps[] => bots.map((bot, index) => ({
    key: `bot_${index}`,
    value: bot.id,
    text: bot.name,
  } as DropdownItemProps));

  const getStationOptions = (): DropdownItemProps[] => ([
    { key:'station_all', text: 'All stations', value: 0 },
    ...stations.map((station, index) => ({
      key: `station_${index}`,
      value: station.id,
      text: station.stationName,
    } as DropdownItemProps)),
  ]);

  const validateField = (name: string, value: unknown) => {
    switch (name) {
      case "name":
        return ((value as string)?.trim() ?? "") === "" ? "Name is required." : null;
      case "channelId":
        return ((value as string)?.trim() ?? "") === "" ? "Channel is required." : null;
      case "shouldSendTemplate":
        return ((value as string)?.trim() ?? "") === "" ? "Should Send Template is required" : null
      case "messageTemplate":
        return ((value as string)?.trim() ?? "") === "" ? "Message Template is required." : null
      case "timeoutTemplate":
        return ((value as string)?.trim() ?? "") === "" ? "Timeout Template is required." : null
      default:
        return "";
    }
  };

  if (changed != initiallyChanged) {
    setInitiallyChanged(!initiallyChanged);
    setTimeout(() => {
      updateButtonAttributes(0, { disabled: !changed });
      updateButtonAttributes(1, { disabled: !changed });
    }, 1);
  }

  const dispatchChange = (name: string, value: unknown) => {
    dispatch(updateMessage({
      name: name,
      value: value
    }));
    const error = validateField(name, value);
    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  }

  const panes = [
    {
      menuItem: (<MenuItem key='tab0menu0'>
        Should send
        { hasError('shouldSendTemplate') && <Icon name="exclamation circle" color="red" /> }
      </MenuItem>),
      pane: (<TabPane key='tab0'>
        <Form.Field error={hasError('shouldSendTemplate')}>
          <TemplateEditor renderTemplate={() => 'foo'} template={message?.shouldSendTemplate ?? ''}
            onChange={(template) => dispatchChange('shouldSendTemplate', template)} />
          <Message error size="tiny" content={getError('shouldSendTemplate')} />
        </Form.Field>
      </TabPane>)
    },
    {
      menuItem: (<MenuItem key='tab1menu0'>
        Timeout template
        { hasError('timeoutTemplate') && <Icon name="exclamation circle" color="red" /> }
      </MenuItem>),
      pane: (<TabPane key='tab1'>
        <Form.Field>
          <TemplateEditor renderTemplate={() => 'foo'} template={message?.timeoutTemplate ?? ''}
            onChange={(template) => dispatchChange('timeoutTemplate', template)} />
          <Message error size="tiny" content={getError('timeoutTemplate')} />
        </Form.Field>
      </TabPane>)
    },
    {
      menuItem: (<MenuItem key='tab2menu0'>
        Message template
        { hasError('messageTemplate') && <Icon name="exclamation circle" color="red" /> }
      </MenuItem>),
      pane: (<TabPane key='tab2'>
        <Form.Field>
          <TemplateEditor renderTemplate={() => 'foo'} template={message?.messageTemplate ?? ''}
            onChange={(template) => dispatchChange('messageTemplate', template)} />
          <Message error size="tiny" content={getError('messageTemplate')} />
        </Form.Field>
      </TabPane>)
    },
  ];

  const onFormCheckboxChange = (_: unknown, data: CheckboxProps) => {
    dispatchChange(data.name!, data.checked);
  };

  const onFormInputChange = (event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
    dispatchChange(event.target.name!, data.value);
  };

  const onFormDropdownChange = (_: unknown, data: DropdownProps) => {
    dispatchChange(data.name, data.value);
  };

  return <Segment loading={loading} >
    <Form error>
      <Form.Checkbox name='enabled' label='Enabled' checked={message?.enabled ?? false} onChange={onFormCheckboxChange} />
      <Form.Input name='name' label='Name' value={message?.name ?? ''} onChange={onFormInputChange} error={hasError('name')} />
      <Divider />
      <Form.Group>
        <Form.Dropdown
          width={'8'}
          label='Bot'
          value={message?.botId ?? getBotOptions()?.[0]?.value}
          name='botId'
          onChange={onFormDropdownChange}
          options={getBotOptions()}
        />
        <Form.Dropdown
          width={'8'}
          label='Station'
          value={message?.stationId ?? 0}
          name='stationId'
          onChange={onFormDropdownChange}
          options={getStationOptions()}
        />
      </Form.Group>
      <Divider />
      <Form.Input
        width={'8'}
        name='channelId'
        label='Channel id'
        value={message?.channelId ?? ''}
        onChange={onFormInputChange}
        error={hasError('channelId')}>
        <input />
        <Button content='Check' color='orange' onClick={() => dispatch(getChannel())} />
      </Form.Input>
      Channel name: <Label basic>{message?.channelName ?? ''}</Label>
      <Divider />
      <Header as='h4'>
        Templates&nbsp;&nbsp;
        <MessagePreview shown={previewShown} setShown={setPreviewShown} />
      </Header>
      <Tab panes={panes} renderActiveOnly={false} />
    </Form>
  </Segment>;
};

export const MessageEditPage = connect(mapStateToProps)(Component);