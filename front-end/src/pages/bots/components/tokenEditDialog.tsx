import { useState, FC } from "react";
import { TFunction } from "i18next";
import { modals } from "@mantine/modals";
import { Textarea, Button, Stack } from "@mantine/core";

type OpenTokenEditOptions = {
  create?: boolean;
  token?: string;
  onClose: (result: boolean, token: string) => void;
  title?: string;
  t: TFunction;
};

export function openTokenEditDialog({ create = false, token = "", onClose, title, t }: OpenTokenEditOptions) {
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
            {t('button.cancel')}
          </Button>
          <Button onClick={handleSave}>{t('button.save')}</Button>
        </div>
      </Stack>
    );
  };
  
  const id: string | undefined = modals.open({
    title: title ?? (create ? t('tokenEdit.set') : t('tokenEdit.edit')),
    centered: true,
    children: <Inner />,
  });
}