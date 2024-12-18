import { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, CheckboxProps, Divider, DropdownItemProps, DropdownProps, Form, Header, InputOnChangeData, Label, Segment, Tab, TabPane } from "semantic-ui-react";
import { PageHeaderButton, useHeaderContent } from "../../providers";
import { RootState, useAppDispatch } from "../../stores/store";
import { editMessage, fetchBots, fetchStations, getChannel, saveMessage } from "../../stores/thunks";
import { finishEditingMessage, updateMessage } from "../../stores/slices";
import { BotItem, ServerMessageItem, ServerStationItem } from "../../stores/types";
import { connect } from "react-redux";
import { TemplateEditor } from "./components";
import { createSelector } from "@reduxjs/toolkit";

type ComponentProps = {
  bots: BotItem[];
  stations: ServerStationItem[];
  message?: ServerMessageItem;
  loading: boolean;
  changed: boolean;
};

const selectBots = (state: RootState) => state.bots;
const selectMessages = (state: RootState) => state.messages;
const selectStations = (state: RootState) => state.stations;

const selectLoading = createSelector(
  [selectBots, selectMessages, selectStations],
  (bots, messages, stations) => bots.loading || messages.loading || stations.loading
);

const mapStateToProps = (state: RootState): ComponentProps => ({
  bots: state.bots.bots,
  stations: state.stations.stations,
  message: state.messages.editingMessage,
  loading: selectLoading(state),
  changed: state.messages.changed,
});

const Component: FC<ComponentProps> = ({ bots, stations, message, loading, changed }: ComponentProps) => {
  const dispatch = useAppDispatch();
  const { messageId } = useParams();
  const messageIdInt = parseInt(messageId!);
  const [initiallyChanged, setInitiallyChanged] = useState(false);

  useEffect(() => {
    dispatch(fetchBots());
    dispatch(fetchStations());
    dispatch(editMessage(messageIdInt));
    return () => { dispatch(finishEditingMessage()); };
  }, [dispatch]);

  useEffect(() => {
    setHeaderText(`Editing message ${message?.name ?? ''}`);
    return () => setHeaderText('');
  }, [message?.name]);

  const getHeaderButtons = (dataChanged: boolean): PageHeaderButton[] => [
    { text: 'Save', color: "green", onClick: () => dispatch(saveMessage()), disabled: !dataChanged, },
    { text: 'Cancel', color: "black", onClick: () => dispatch(editMessage(messageIdInt)), disabled: !dataChanged, },
  ];
  const { setHeaderButtons, updateButtonAttributes, setHeaderText } = useHeaderContent();
  useEffect(() => {
    setHeaderButtons(getHeaderButtons(false));
    return () => setHeaderButtons([]);
  }, [setHeaderButtons]);

  if (!message) {
    return <>Loading...</>
  }

  const getBotOptions = (): DropdownItemProps[] => bots.map((bot, index) => ({
    key: `bot_${index}`,
    value: bot.id,
    text: bot.name,
  } as DropdownItemProps));

  const getStationOptions = (): DropdownItemProps[] => ([
    { key:'station_none', text: 'None', value: undefined },
    ...stations.map((station, index) => ({
      key: `station_${index}`,
      value: station.id,
      text: station.stationName,
    } as DropdownItemProps))
  ]);

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
  }

  const panes = [
    { menuItem: "'Should send' template", pane: (<TabPane key='tab0'>
      <Form.Field>
        <TemplateEditor renderTemplate={() => 'foo'} template={message.shouldSendTemplate}
          onChange={(template) => dispatchChange('shouldSendTemplate', template)} />
      </Form.Field>
    </TabPane>) },
    { menuItem: 'Timeout template', pane: (<TabPane key='tab1'>
      <Form.Field>
        <TemplateEditor renderTemplate={() => 'foo'} template={message.timeoutTemplate}
          onChange={(template) => dispatchChange('timeoutTemplate', template)} />
      </Form.Field>
    </TabPane>) },
    { menuItem: 'Message template', pane: (<TabPane key='tab2'>
      <Form.Field>
        <TemplateEditor renderTemplate={() => 'foo'} template={message.messageTemplate}
          onChange={(template) => dispatchChange('messageTemplate', template)} />
      </Form.Field>
    </TabPane>) },
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

  return <Segment>
    <Form loading={loading}>
      <Form.Checkbox name='enabled' label='Enabled' checked={message.enabled} onChange={onFormCheckboxChange} />
      <Form.Input name='name' label='Name' value={message.name} onChange={onFormInputChange} />        
      <Form.Input width={'8'} name='channelId' label='Channel id' action value={message.channelId} onChange={onFormInputChange} >
        <input />
        <Button content='Check' color='orange' onClick={() => dispatch(getChannel())} />
      </Form.Input>
      Channel name: <Label basic>{message.channelName}</Label>
      <Divider />
      <Form.Group>
        <Form.Dropdown width={'8'} label='Bot' value={message.botId} name='botId' onChange={onFormDropdownChange} options={getBotOptions()} />
        <Form.Dropdown width={'8'} label='Station' value={message.stationId} name='stationId' onChange={onFormDropdownChange} options={getStationOptions()} />
      </Form.Group>
      <Divider />
      <Header as='h4' content='Templates' />
      <Tab panes={panes} renderActiveOnly={false} />
    </Form>
  </Segment>;
};

export const MessageEditPage = connect(mapStateToProps)(Component);