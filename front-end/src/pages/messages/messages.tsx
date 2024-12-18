import { FC, useEffect } from "react"
import { connect, useDispatch } from "react-redux";
import { Label, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from "semantic-ui-react"
import { AppDispatch, RootState } from "../../stores/store";
import { fetchMessages } from "../../stores/thunks";
import { ServerMessageListItem } from "../../stores/types";
import { useNavigate } from "react-router-dom";

type ComponentProps = {
  messages: Array<ServerMessageListItem>;
  loading: boolean;
  error: string | null;
  creating: boolean;
};

const mapStateToProps = (state: RootState): ComponentProps => ({
  messages: state.messages.messages,
  loading: state.messages.loading,
  error: state.messages.error,
  creating: state.messages.creating,
});

const Component: FC<ComponentProps> = ({ messages }: ComponentProps) => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchMessages());
  }, [dispatch]);

  const navigate = useNavigate();

  const onEditClick = (messageId: number, _1: unknown, _2: unknown) => {
    navigate(`/messages/edit/${messageId}`);
  };

  return <Table striped celled inverted selectable compact>
    <TableHeader>
      <TableRow>
        <TableHeaderCell>Name</TableHeaderCell>
        <TableHeaderCell>Channel</TableHeaderCell>
        <TableHeaderCell>Station</TableHeaderCell>
        <TableHeaderCell>Bot</TableHeaderCell>
        <TableHeaderCell>Last message sent</TableHeaderCell>
        <TableHeaderCell width={1}>Active</TableHeaderCell>
        <TableHeaderCell width={1}></TableHeaderCell>
      </TableRow>
    </TableHeader>
    <TableBody>
      {
        messages.map((message, index) => <TableRow key={`message_${index}`}>
          <TableCell>{message.name}</TableCell>
          <TableCell>{message.channelName}</TableCell>
          <TableCell>{message.stationName}</TableCell>
          <TableCell>{message.botName}</TableCell>
          <TableCell>{message.lastSentTime.toString()}</TableCell>
          <TableCell textAlign='center'>
            <Label color={message.enabled ? 'green' : 'red'} content={message.enabled ? 'Yes' : 'No'} />
          </TableCell>
          <TableCell textAlign='center'>
            <Label color={'teal'} content='Edit'
              style={{ cursor: 'pointer' }} onClick={onEditClick.bind(this, message.id!)}/>
          </TableCell>
        </TableRow>)
      }
    </TableBody>
  </Table>
}

export const MessagesPage = connect(mapStateToProps)(Component);