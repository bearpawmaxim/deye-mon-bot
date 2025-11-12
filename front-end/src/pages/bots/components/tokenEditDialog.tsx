import { useState, FC } from "react";
import { modals } from "@mantine/modals";
import { Textarea, Button, Stack } from "@mantine/core";

type OpenTokenEditOptions = {
  create?: boolean;
  token?: string;
  onClose: (result: boolean, token: string) => void;
  title?: string;
};

export function openTokenEditDialog({ create = false, token = "", onClose, title }: OpenTokenEditOptions) {
  const Inner: FC = () => {
    const [editingToken, setEditingToken] = useState(token);

    const handleSave = () => {
      if (id) {
        modals.close(id);
      }
      onClose(true, editingToken);
    };

    const handleCancel = () => {
      if (id) {
        modals.close(id);
      }
      onClose(false, token);
    };

    return (
      <Stack>
        <Textarea minRows={3} value={editingToken} onChange={(e) => setEditingToken(e.currentTarget.value)} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="default" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </Stack>
    );
  };
  
  const id: string | undefined = modals.open({
    title: title ?? (create ? "Set token" : "Edit token"),
    centered: true,
    children: <Inner />,
  });
}