import { FC } from "react";
import { TemplatePreview } from "../../../stores/types";
import { Group, Badge, Paper, ScrollArea, Text, Button } from "@mantine/core";
import Markdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { TFunction } from "i18next";

type MessagePreviewProps = {
  handleClose: () => void;
  preview: TemplatePreview;
  t?: TFunction;
};

export const MessagePreview: FC<MessagePreviewProps> = ({ handleClose, preview, t }) => {
  const yes = t ? t('buttons.yes') : 'YES';
  const no = t ? t('buttons.no') : 'NO';
  return <>
    <Group>
      <Text fw={500}>{t ? t('previewLabels.shouldSend') : 'Should send:'}</Text>
      <Badge color={(preview?.shouldSend ?? false) ? 'teal' : 'orange'}>{(preview?.shouldSend ?? false) ? yes : no}</Badge>
    </Group>
    <Group>
      <Text fw={500}>{t ? t('previewLabels.timeout') : 'Timeout (seconds):'}</Text>
      <Badge>{preview?.timeout}</Badge>
    </Group>
    <div>
      <Text fw={500} mb="xs">{t ? t('previewLabels.message') : 'Message:'}</Text>
      <Paper withBorder radius="md" p="sm">
        <ScrollArea style={{ maxHeight: 400 }}>
          <Markdown remarkPlugins={[remarkGfm, remarkBreaks]}>{preview?.message ?? ''}</Markdown>
        </ScrollArea>
      </Paper>
    </div>
    <Group justify="flex-end">
      <Button variant="default" onClick={handleClose}>{t ? (t('buttons.close') ?? t('button.close')) : 'Close'}</Button>
    </Group>
  </>;
}