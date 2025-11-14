import { FC, useCallback, useEffect, useState } from "react"
import { connect } from "react-redux";
import { RootState, useAppDispatch } from "../../stores/store";
import { cancelUsersEditing, deleteUser, deleteUserToken, fetchUsers, generateUserToken, saveUsers } from "../../stores/thunks";
import { cancelCreatingUser, createUser, startCreatingUser, updateUser } from "../../stores/slices";
import { PageHeaderButton, useHeaderContent } from "../../providers";
import { createSelector } from "@reduxjs/toolkit";
import { UserItem } from "../../stores/types";
import { DataTable, ErrorMessage, Page } from "../../components";
import { ColumnDataType } from "../../types";
import { Badge, Button, Code, CopyButton, Group, Modal, PasswordInput, Stack, Switch, Tabs, Text, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getCurlExample, getCurlExampleOneLine, getHomeAssistantExample, integrationNotes } from "../../utils";


type ComponentProps = {
  users: Array<UserItem>;
  loading: boolean;
  error: string | null;
  changed: boolean;
  creating: boolean;
};

const selectUsers = (state: RootState) => state.users.users;

const selectChanged = createSelector(
  [selectUsers],
  (users) => users.some(u => u.changed)
);

const mapStateToProps = (state: RootState): ComponentProps => ({
  users: state.users.users,
  loading: state.users.loading,
  error: state.users.error,
  changed: selectChanged(state),
  creating: state.users.creating,
});

const Component: FC<ComponentProps> = ({ users, loading, error, changed }: ComponentProps) => {
  const dispatch = useAppDispatch();
  const [initiallyChanged, setInitiallyChanged] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const [tokenModalOpened, { open: openTokenModal, close: closeTokenModal }] = useDisclosure(false);
  const [integrationModalOpened, { open: openIntegrationModal, close: closeIntegrationModal }] = useDisclosure(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [viewingToken, setViewingToken] = useState<string | null>(null);
  const [viewingTokenUser, setViewingTokenUser] = useState<UserItem | null>(null);
  const [formData, setFormData] = useState({ name: '', password: '', isReporter: false, isActive: true });

  const fetchData = useCallback(() => dispatch(fetchUsers()), [dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const openCreateDialog = useCallback(() => {
    setEditingUser(null);
    setFormData({ name: '', password: '', isReporter: false, isActive: true });
    dispatch(startCreatingUser());
    open();
  }, [dispatch, open]);

  const openEditDialog = useCallback((user: UserItem) => {
    setEditingUser(user);
    setFormData({ name: user.name, password: '', isReporter: user.isReporter, isActive: user.isActive });
    open();
  }, [open]);

  const handleSave = useCallback(() => {
    if (editingUser) {
      dispatch(updateUser({
        id: editingUser.id,
        name: formData.name,
        password: formData.password || undefined,
        isReporter: formData.isReporter,
        isActive: formData.isActive,
      }));
    } else {
      dispatch(createUser({
        name: formData.name,
        password: formData.password,
        isReporter: formData.isReporter,
      }));
    }
    close();
  }, [editingUser, formData, dispatch, close]);

  const handleCancel = useCallback(() => {
    if (!editingUser) {
      dispatch(cancelCreatingUser());
    }
    close();
  }, [editingUser, dispatch, close]);

  const handleDelete = useCallback((user: UserItem) => {
    modals.openConfirmModal({
      title: 'Delete User',
      children: `Are you sure you want to delete user "${user.name}"?`,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => dispatch(deleteUser(user.id)),
    });
  }, [dispatch]);

  const handleGenerateToken = useCallback((user: UserItem) => {
    modals.openConfirmModal({
      title: 'Generate API Token',
      children: user.apiKey 
        ? `User "${user.name}" already has a token. Generate a new one? This will replace the existing token.`
        : `Generate API token for user "${user.name}"?`,
      labels: { confirm: 'Generate', cancel: 'Cancel' },
      confirmProps: { color: 'blue' },
      onConfirm: () => dispatch(generateUserToken(user.id)),
    });
  }, [dispatch]);

  const handleDeleteToken = useCallback((user: UserItem) => {
    modals.openConfirmModal({
      title: 'Delete API Token',
      children: `Are you sure you want to delete API token for user "${user.name}"?`,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => dispatch(deleteUserToken(user.id)),
    });
  }, [dispatch]);

  const handleViewToken = useCallback((user: UserItem) => {
    setViewingToken(user.apiKey || null);
    setViewingTokenUser(user);
    openTokenModal();
  }, [openTokenModal]);

  const handleDeleteFromModal = useCallback(() => {
    if (viewingTokenUser) {
      closeTokenModal();
      handleDeleteToken(viewingTokenUser);
    }
  }, [viewingTokenUser, closeTokenModal, handleDeleteToken]);

  const handleShowIntegration = useCallback(() => {
    openIntegrationModal();
  }, [openIntegrationModal]);

  const getHeaderButtons = useCallback((dataChanged: boolean): PageHeaderButton[] => [
    { text: 'Create', icon: "add", color: "teal", onClick: () => openCreateDialog(), disabled: false, },
    { text: 'Save', icon: "save", color: "green", onClick: () => dispatch(saveUsers()), disabled: !dataChanged, },
    { text: 'Cancel', icon: "cancel", color: "black", onClick: () => dispatch(cancelUsersEditing()), disabled: !dataChanged, },
  ], [openCreateDialog, dispatch]);

  const { setHeaderButtons, updateButtonAttributes } = useHeaderContent();
  useEffect(() => {
    setHeaderButtons(getHeaderButtons(false));
    return () => setHeaderButtons([]);
  }, [setHeaderButtons, getHeaderButtons]);

  if (error) {
    return <ErrorMessage content={error}/>;
  }

  const onUserActiveChange = (id: number, isActive: boolean) => {
    dispatch(updateUser({ id, isActive }));
  };
  
  const onUserReporterChange = (id: number, isReporter: boolean) => {
    dispatch(updateUser({ id, isReporter }));
  };

  if (changed != initiallyChanged) {
    setInitiallyChanged(!initiallyChanged);
    setTimeout(() => {
      updateButtonAttributes(1, { disabled: !changed });
      updateButtonAttributes(2, { disabled: !changed });
    }, 1);
  }

  return <>
    <Page loading={loading}>
      <DataTable<UserItem>
        data={users}
        fetchAction={fetchData}
        columns={[
          {
            id: 'name',
            header: 'Username',
            enableSorting: true,
            accessorKey: 'name',
          },
          {
            id: 'isActive',
            header: 'Active',
            enableSorting: true,
            accessorKey: 'isActive',
            meta: {
              dataType: ColumnDataType.Boolean,
              readOnly: false,
              checkedChange: (row, state) => onUserActiveChange(row.id!, state),
            },
          },
          {
            id: 'isReporter',
            header: 'Is Reporter',
            enableSorting: true,
            accessorKey: 'isReporter',
            meta: {
              dataType: ColumnDataType.Boolean,
              readOnly: false,
              checkedChange: (row, state) => onUserReporterChange(row.id!, state),
            },
          },
          {
            id: 'apiKey',
            header: 'API Token',
            accessorKey: 'apiKey',
            cell: ({ row }) => {
              const user = row.original;
              
              if (!user.isReporter) {
                return (
                  <Badge 
                    variant="light"
                    color="gray"
                  >
                    N/A
                  </Badge>
                );
              }
              
              if (!user.apiKey) {
                if (changed) {
                  return (
                    <Badge 
                      variant="light"
                      color="orange"
                      style={{ cursor: 'not-allowed' }}
                      title="Please save changes before generating a token"
                    >
                      Save First
                    </Badge>
                  );
                }
                return (
                  <Badge 
                    variant="light"
                    color="green"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleGenerateToken(user)}
                  >
                    Generate Token
                  </Badge>
                );
              }
              return (
                <Badge 
                  variant="light"
                  color="blue"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleViewToken(user)}
                >
                  Show Token
                </Badge>
              );
            },
          },
          {
            id: 'actions',
            header: 'Actions',
            meta: {
              dataType: 'actions',
              actions: [
                {
                  icon: 'edit',
                  color: 'blue',
                  text: 'Edit',
                  onlyIcon: true,
                  clickHandler: (row) => openEditDialog(row),
                },
                {
                  icon: 'trash',
                  color: 'red',
                  text: 'Delete',
                  onlyIcon: true,
                  clickHandler: (row) => handleDelete(row),
                },
              ],
            },
          },
        ]}
        tableKey={"users"}
      />
    </Page>

    <Modal opened={opened} onClose={handleCancel} title={editingUser ? "Edit User" : "Create User"}>
      <Stack>
        <TextInput
          label="Username"
          placeholder="Enter username"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <PasswordInput
          label={editingUser ? "New Password (leave empty to keep current)" : "Password"}
          placeholder="Enter password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required={!editingUser}
        />
        <Switch
          label="Active"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.currentTarget.checked })}
        />
        <Switch
          label="Is Reporter (cannot login via UI)"
          checked={formData.isReporter}
          onChange={(e) => setFormData({ ...formData, isReporter: e.currentTarget.checked })}
        />
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleSave} disabled={!formData.name || (!editingUser && !formData.password)}>
            {editingUser ? 'Update' : 'Create'}
          </Button>
        </Group>
      </Stack>
    </Modal>

    <Modal opened={tokenModalOpened} onClose={closeTokenModal} title="API Token" size="lg">
      <Stack>
        <TextInput
          label="Full Token"
          value={viewingToken || ''}
          readOnly
          styles={{
            input: {
              fontFamily: 'monospace',
              fontSize: '12px',
              cursor: 'text',
              userSelect: 'all',
            }
          }}
          onClick={(e) => e.currentTarget.select()}
        />
        <Group justify="space-between" mt="md">
          <Group>
            <Button
              leftSection={<FontAwesomeIcon icon="trash" />}
              color="red"
              variant="light"
              onClick={handleDeleteFromModal}
            >
              Delete
            </Button>
            <Button
              leftSection={<FontAwesomeIcon icon="code" />}
              color="violet"
              variant="light"
              onClick={handleShowIntegration}
            >
              Show Integration
            </Button>
          </Group>
          <Group>
            <CopyButton value={viewingToken || ''}>
              {({ copied, copy }) => (
                <Button
                  leftSection={<FontAwesomeIcon icon={copied ? 'check' : 'copy'} />}
                  color={copied ? 'teal' : 'blue'}
                  onClick={copy}
                >
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </Button>
              )}
            </CopyButton>
            <Button variant="default" onClick={closeTokenModal}>Close</Button>
          </Group>
        </Group>
      </Stack>
    </Modal>

    <Modal opened={integrationModalOpened} onClose={closeIntegrationModal} title="API Integration Examples" size="xl">
      <Tabs defaultValue="curl">
        <Tabs.List>
          <Tabs.Tab value="curl" leftSection={<FontAwesomeIcon icon="terminal" />}>
            cURL
          </Tabs.Tab>
          <Tabs.Tab value="homeassistant" leftSection={<FontAwesomeIcon icon="home" />}>
            Home Assistant
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="curl" pt="md">
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              {integrationNotes.curl.description}
            </Text>
            <Code block style={{ position: 'relative' }}>
              {getCurlExample(viewingToken || 'YOUR_API_TOKEN')}
            </Code>
            <CopyButton value={getCurlExampleOneLine(viewingToken || 'YOUR_API_TOKEN')}>
              {({ copied, copy }) => (
                <Button
                  fullWidth
                  leftSection={<FontAwesomeIcon icon={copied ? 'check' : 'copy'} />}
                  color={copied ? 'teal' : 'blue'}
                  onClick={copy}
                >
                  {copied ? 'Copied!' : 'Copy cURL Command'}
                </Button>
              )}
            </CopyButton>
            <Text size="xs" c="dimmed">
              Note: {integrationNotes.curl.note}
            </Text>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="homeassistant" pt="md">
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              {integrationNotes.homeAssistant.description}
            </Text>
            <Code block>
              {getHomeAssistantExample(viewingToken || 'YOUR_API_TOKEN')}
            </Code>
            <CopyButton value={getHomeAssistantExample(viewingToken || 'YOUR_API_TOKEN')}>
              {({ copied, copy }) => (
                <Button
                  fullWidth
                  leftSection={<FontAwesomeIcon icon={copied ? 'check' : 'copy'} />}
                  color={copied ? 'teal' : 'blue'}
                  onClick={copy}
                >
                  {copied ? 'Copied!' : 'Copy Home Assistant Configuration'}
                </Button>
              )}
            </CopyButton>
            <Text size="xs" c="dimmed">
              Note: {integrationNotes.homeAssistant.note}
            </Text>
          </Stack>
        </Tabs.Panel>
      </Tabs>
      <Group justify="flex-end" mt="xl">
        <Button variant="default" onClick={closeIntegrationModal}>Close</Button>
      </Group>
    </Modal>
  </>
}

export const UsersPage = connect(mapStateToProps)(Component);

