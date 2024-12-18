import { FC, useEffect, useState } from "react";
import { Button, Form, Modal, ModalActions, ModalContent, ModalDescription, ModalHeader, TextArea, TextAreaProps } from "semantic-ui-react";


type TokenEditDialogProps = {
  create: boolean;
  opened: boolean;
  setOpened: (opened: boolean) => void;
  token: string;
  changed: (result: boolean, token: string) => void;
};

export const TokenEditDialog: FC<TokenEditDialogProps> = ({create, opened, setOpened, token, changed}: TokenEditDialogProps) => {
  const [editingToken, setEditingToken] = useState(token);

  useEffect(() => {
    setEditingToken(token);
  }, [token]);

  const onTokenChange = (_: unknown, data: TextAreaProps) => {
    setEditingToken(data.value as string ?? '');
  };

  const onSaveClick = (_: unknown) => {
    setOpened(false);
    changed(true, editingToken);
    if (create) {
      setEditingToken(token);
    }
  };

  const onCancelClick = (_: unknown) => {
    setOpened(false);
    changed(false, token);
    setEditingToken(token);
  };

  return <Modal open={opened}>
    <ModalHeader>{create ? 'Set' : 'Edit'} token</ModalHeader>
    <ModalContent>
      <ModalDescription>
        <Form>
          <TextArea style={{ minHeight: 60, width: '100%' }}
            value={editingToken}
            onChange={onTokenChange}
          />
        </Form>
      </ModalDescription>
    </ModalContent>
    <ModalActions>
      <Button color='black' content='Cancel' onClick={onCancelClick} />
      <Button
        content="Save"
        labelPosition='right'
        icon='checkmark'
        onClick={onSaveClick}
        positive
      />
    </ModalActions>
  </Modal>
}