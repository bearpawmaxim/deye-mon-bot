import { FC, useCallback, useEffect } from "react"
import { AllowedChatListItem, ChatRequestListItem } from "../../stores/types";
import { connect } from "react-redux";
import { RootState, useAppDispatch } from "../../stores/store";
import { approveChatRequest, disallowChat, fetchAllowedChats, fetchChatRequests, rejectChatRequest } from "../../stores/thunks";
import { DataTable, ErrorMessage, Page } from "../../components";
import { Title } from "@mantine/core";
import { ColumnDataType } from "../../types";
import { ObjectId } from "../../schemas";

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

  const fetchChats = useCallback(
    () => dispatch(fetchAllowedChats()),
    [dispatch],
  );
  const fetchRequests = useCallback(
    () => dispatch(fetchChatRequests()),
    [dispatch],
  );

  useEffect(() => {
    fetchChats();
    fetchRequests();
  }, [dispatch, fetchChats, fetchRequests]);

  const approveClick = (id: ObjectId) => {
    dispatch(approveChatRequest(id));
  }

  const rejectClick = (id: ObjectId) => {
    dispatch(rejectChatRequest(id));
  }

  const disallowClick = (id: ObjectId) => {
    dispatch(disallowChat(id));
  }

  if (error) {
    return <ErrorMessage content={error} />;
  }

  return <>
    <Page loading={loading}>
      <Title mt='sm' ta='center' order={4}>Allowed chats</Title>
      <DataTable<AllowedChatListItem>
        data={allowedChats}
        fetchAction={fetchChats}
        columns={[
          {
            id: 'chat',
            header: 'Chat',
            accessorKey: 'chatName',
            enableSorting: true,
          },
          {
            id: 'bot',
            header: 'Bot',
            accessorKey: 'botName',
            enableSorting: true,
          },
          {
            id: 'approveDate',
            header: 'Approved on',
            accessorKey: 'approveDate',
            enableSorting: true,
            meta: {
              dataType: ColumnDataType.DateTime,
            },
          },
          {
            id: 'actions',
            meta: {
              dataType: 'actions',
              actions: [
                {
                  text: 'Disallow',
                  icon: 'cancel',
                  color: 'red',
                  clickHandler: (row) => disallowClick(row.id!),
                }
              ]
            }
          }
        ]}
        tableKey="allowedChats"
      />
    </Page>
    <Page loading={loading} mt='sm'>
      <Title mt='sm' ta='center' order={4}>Chat requests</Title>
      <DataTable<ChatRequestListItem>
        data={chatRequests}
        fetchAction={fetchRequests}
        columns={[
          {
            id: 'chat',
            header: 'Chat',
            accessorKey: 'chatName',
            enableSorting: true,
          },
          {
            id: 'bot',
            header: 'Bot',
            accessorKey: 'botName',
            enableSorting: true,
          },
          {
            id: 'requestDate',
            header: 'Requested on',
            accessorKey: 'requestDate',
            enableSorting: true,
            meta: {
              dataType: ColumnDataType.DateTime,
            },
          },
          {
            id: 'actions',
            meta: {
              dataType: 'actions',
              actions: [
                {
                  text: 'Approve',
                  icon: 'check',
                  color: 'green',
                  clickHandler: (row) => approveClick(row.id!),
                },
                {
                  text: 'Reject',
                  icon: 'cancel',
                  color: 'red',
                  clickHandler: (row) => rejectClick(row.id!),
                }
              ]
            }
          }
        ]}
        tableKey="chatRequests"
      />
    </Page>
  </>
};

export const ChatsPage = connect(mapStateToProps)(Component);