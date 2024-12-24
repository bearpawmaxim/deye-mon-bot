import { FC, useEffect } from "react"
import { Button, Header, Segment, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from "semantic-ui-react"
import { AllowedChatListItem, ChatRequestListItem } from "../../stores/types";
import { connect } from "react-redux";
import { RootState, useAppDispatch } from "../../stores/store";
import { approveChatRequest, fetchAllowedChats, fetchChatRequests } from "../../stores/thunks";

type ComponentProps = {
  allowedChats: AllowedChatListItem[];
  chatRequests: ChatRequestListItem[];
  loading: boolean;
};

const mapStateToProps = (state: RootState): ComponentProps => ({
  allowedChats: state.chats.allowedChats,
  chatRequests: state.chats.chatRequests,
  loading: state.chats.loading,
});

const Component: FC<ComponentProps> = ({ allowedChats, chatRequests, loading }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchAllowedChats());
    dispatch(fetchChatRequests());
  }, [dispatch]);

  const approveClick = (id: number) => {
    dispatch(approveChatRequest(id));
  }

  return <Segment basic loading={loading}>
    <Header as='h4' content='Allowed chats' />
    <Table striped celled inverted selectable compact>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Chat</TableHeaderCell>
          <TableHeaderCell>Bot</TableHeaderCell>
          <TableHeaderCell>Approved on</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        { allowedChats.map((chat, index) => (<TableRow key={`chat_${index}`}>
            <TableCell>{chat.chatName}</TableCell>
            <TableCell>{chat.botName}</TableCell>
            <TableCell>{chat.approveDate.toString()}</TableCell>
          </TableRow>)) }
      </TableBody>
    </Table>
    <Header as='h4' content='Chat requests' />
    <Table striped celled inverted selectable compact>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Chat</TableHeaderCell>
          <TableHeaderCell>Bot</TableHeaderCell>
          <TableHeaderCell>Requested on</TableHeaderCell>
          <TableHeaderCell width={1} />
        </TableRow>
      </TableHeader>
      <TableBody>
      { chatRequests.map((chat, index) => (<TableRow key={`chat_${index}`}>
          <TableCell>{chat.chatName}</TableCell>
          <TableCell>{chat.botName}</TableCell>
          <TableCell>{chat.requestDate.toString()}</TableCell>
          <TableCell>
            <Button content='Approve' color="teal" onClick={approveClick.bind(this, chat.id)} />
          </TableCell>
        </TableRow>)) }
      </TableBody>
    </Table>
  </Segment>
};

export const ChatsPage = connect(mapStateToProps)(Component);