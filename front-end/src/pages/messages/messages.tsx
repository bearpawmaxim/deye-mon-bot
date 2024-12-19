import { FC, useEffect } from "react"
import { connect } from "react-redux";
import { Label, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from "semantic-ui-react"
import { RootState, useAppDispatch } from "../../stores/store";
import { fetchMessages } from "../../stores/thunks";
import { ServerMessageListItem } from "../../stores/types";
import { useNavigate } from "react-router-dom";
import { PageHeaderButton, useHeaderContent } from "../../providers";

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
  const dispatch = useAppDispatch();
    const getHeaderButtons = (): PageHeaderButton[] => [
      { text: 'Create', color: "teal", onClick: () => onCreateClick(), disabled: false, },
    ];
    const { setHeaderButtons } = useHeaderContent();
    useEffect(() => {
      setHeaderButtons(getHeaderButtons());
      return () => setHeaderButtons([]);
    }, [setHeaderButtons]);  

  useEffect(() => {
    dispatch(fetchMessages());
  }, [dispatch]);

  const navigate = useNavigate();

  const onCreateClick = () => {
    navigate(`/messages/create`);
  }

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
          <TableCell>{Boolean(message.stationName) ? message.stationName : 'All stations'}</TableCell>
          <TableCell>{message.botName}</TableCell>
          <TableCell>{message.lastSentTime?.toString() ?? 'Never'}</TableCell>
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