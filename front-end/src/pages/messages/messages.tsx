import { FC, useCallback, useEffect } from "react"
import { connect } from "react-redux";
import { RootState, useAppDispatch } from "../../stores/store";
import { fetchMessages } from "../../stores/thunks";
import { ServerMessageListItem } from "../../stores/types";
import { useNavigate } from "react-router-dom";
import { PageHeaderButton, useHeaderContent } from "../../providers";
import { DataTable, ErrorMessage, Page } from "../../components";
import { ColumnDataType } from "../../types";

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
  const navigate = useNavigate();

  const onCreateClick = useCallback(() => {
    navigate(`/messages/create`);
  }, [navigate]);

  const onEditClick = (messageId: number) => {
    navigate(`/messages/edit/${messageId}`);
  };

  const getHeaderButtons = useCallback((): PageHeaderButton[] => [
    { text: 'Create', icon: "add", color: "teal", onClick: () => onCreateClick(), disabled: false, },
  ], [onCreateClick]);
  const { setHeaderButtons } = useHeaderContent();
  useEffect(() => {
    setHeaderButtons(getHeaderButtons());
    return () => setHeaderButtons([]);
  }, [setHeaderButtons, getHeaderButtons]);  

  const fetchData = useCallback(() => dispatch(fetchMessages()), [dispatch]);
    
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (error) {
    return <ErrorMessage content={error} />;
  }

  return <Page loading={loading}>
    <DataTable<ServerMessageListItem>
      data={messages}
      fetchAction={fetchData}
      columns={[
        {
          id: 'name',
          header: 'Name',
          accessorKey: 'name',
          enableSorting: true,
        },
        {
          id: 'channel',
          header: 'Channel',
          accessorKey: 'channelName',
          enableSorting: true,
        },
        {
          id: 'station',
          header: 'Stations',
          accessorKey: 'stationName',
          enableSorting: true,
        },
        {
          id: 'bot',
          header: 'Bot',
          accessorKey: 'botName',
          enableSorting: true,
        },
        {
          id: 'lastMessageSent',
          header: 'Last message sent',
          accessorKey: 'lastSentTime',
          enableSorting: true,
          meta: {
            dataType: ColumnDataType.DateTime,
          },
        },
        {
          id: 'enabled',
          header: 'Enabled',
          accessorKey: 'enabled',
          enableSorting: true,
          meta: {
            dataType: ColumnDataType.Boolean,
          },
        },
        {
          id: 'actions',
          meta: {
            dataType: 'actions',
            actions: [
              {
                text: 'Edit',
                onlyIcon: true,
                icon: 'edit',
                color: 'teal',
                clickHandler: (row) => onEditClick(row.id!),
              },
            ],
          },
        },
      ]}
      tableKey={"messages"}    
    />
  </Page>
}

export const MessagesPage = connect(mapStateToProps)(Component);