import { FC, useEffect } from "react"
import { AllowedChatListItem, ChatRequestListItem } from "../../stores/types";
import { connect } from "react-redux";
import { RootState, useAppDispatch } from "../../stores/store";
import { approveChatRequest, disallowChat, fetchAllowedChats, fetchChatRequests, rejectChatRequest } from "../../stores/thunks";
import { AllowedChatItemRow, ChatRequestItemRow } from "./components";

type ComponentProps = {
  allowedChats: AllowedChatListItem[];
  chatRequests: ChatRequestListItem[];
  loading: boolean;
  error: string | null;
};

const mapStateToProps = (state: RootState): ComponentProps => ({
  allowedChats: state.chats.allowedChats,
  chatRequests: state.chats.chatRequests,
  loading: state.chats.loading,
  error: state.chats.error,
});

const Component: FC<ComponentProps> = ({ allowedChats, chatRequests, loading, error }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchAllowedChats());
    dispatch(fetchChatRequests());
  }, [dispatch]);

  const approveClick = (id: number) => {
    dispatch(approveChatRequest(id));
  }

  const rejectClick = (id: number) => {
    dispatch(rejectChatRequest(id));
  }

  const disallowClick = (id: number) => {
    dispatch(disallowChat(id));
  }

  if (error) {
    return <Message error>Error: {error}</Message>;
  }

  return <Segment basic loading={loading}>
    <Header as='h4' content='Allowed chats' />
    <Table striped celled inverted selectable compact>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Chat</TableHeaderCell>
          <TableHeaderCell>Bot</TableHeaderCell>
          <TableHeaderCell>Approved on</TableHeaderCell>
          <TableHeaderCell width={2}></TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        { allowedChats.map((chat, index) =>
            <AllowedChatItemRow
              key={`chat_${index}`}
              chat={chat}
              disallow={disallowClick.bind(this, chat.id)}/>
          )}
      </TableBody>
    </Table>
    <Header as='h4' content='Chat requests' />
    <Table striped celled inverted selectable compact>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Chat</TableHeaderCell>
          <TableHeaderCell>Bot</TableHeaderCell>
          <TableHeaderCell>Requested on</TableHeaderCell>
          <TableHeaderCell width={3} />
        </TableRow>
      </TableHeader>
      <TableBody>
        { chatRequests.map((request, index) =>
            <ChatRequestItemRow key={`request_${index}`} request={request}
              approve={approveClick.bind(this, request.id)}
              reject={rejectClick.bind(this, request.id)}/>) }
      </TableBody>
    </Table>
  </Segment>
};

export const ChatsPage = connect(mapStateToProps)(Component);