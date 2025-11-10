import { FC, useEffect } from "react"
import { connect } from "react-redux";
import { RootState, useAppDispatch } from "../../stores/store";
import { fetchMessages } from "../../stores/thunks";
import { ServerMessageListItem } from "../../stores/types";
import { useNavigate } from "react-router-dom";
import { PageHeaderButton, useHeaderContent } from "../../providers";
import { MessageItemRow } from "./components";

type ComponentProps = {
  messages: Array<ServerMessageListItem>;
  loading: boolean;
  error: string | null;
};

const mapStateToProps = (state: RootState): ComponentProps => ({
  messages: state.messages.messages,
  loading: state.messages.loading,
  error: state.messages.error,
});

const Component: FC<ComponentProps> = ({ messages, loading, error }: ComponentProps) => {
  const dispatch = useAppDispatch();
    const getHeaderButtons = (): PageHeaderButton[] => [
      { text: 'Create', icon: "add", color: "teal", onClick: () => onCreateClick(), disabled: false, },
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

  const onEditClick = (messageId: number) => {
    navigate(`/messages/edit/${messageId}`);
  };

  if (error) {
    return <Message error>Error: {error}</Message>;
  }

  return <Segment basic loading={loading}>
    <Table striped celled inverted selectable compact>
    <TableHeader>
      <TableRow>
        <TableHeaderCell>Name</TableHeaderCell>
        <TableHeaderCell>Channel</TableHeaderCell>
        <TableHeaderCell>Station</TableHeaderCell>
        <TableHeaderCell>Bot</TableHeaderCell>
        <TableHeaderCell>Last message sent</TableHeaderCell>
        <TableHeaderCell width={1} textAlign="center">Enabled</TableHeaderCell>
        <TableHeaderCell width={1}></TableHeaderCell>
      </TableRow>
    </TableHeader>
    <TableBody>
      { messages.map((message, index) =>
        <MessageItemRow key={`message_${index}`} message={message}
          onEditClick={onEditClick.bind(this, message.id!)} />) }
    </TableBody>
  </Table>
  </Segment>
}

export const MessagesPage = connect(mapStateToProps)(Component);