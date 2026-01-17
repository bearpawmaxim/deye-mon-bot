import { FC } from "react";
import { TemplatePreview } from "../../../stores/types";
import { Group, Badge, Paper, ScrollArea, Text, Button } from "@mantine/core";
import Markdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { TFunction } from "i18next";
import { formatDateTime } from "../../../utils";

type MessagePreviewProps = {
  handleClose: () => void;
  preview: TemplatePreview;
  t: TFunction;
};

export const MessagePreview: FC<MessagePreviewProps> = ({ handleClose, preview, t }) => {
  const yes = t('button.yes');
  const no = t('button.no');
  return <>
    <Group>
      <Text fw={500}>{t('previewLabels.shouldSend')}</Text>
      <Badge color={(preview?.shouldSend ?? false) ? 'teal' : 'orange'}>{(preview?.shouldSend ?? false) ? yes : no}</Badge>
    </Group>
    <Group>
      <Text fw={500}>{t('previewLabels.timeout')}</Text>
      <Badge>{preview?.timeout}</Badge>
    </Group>
    <Group>
      <Text fw={500}>{t('previewLabels.nextSendTime')}</Text>
      <Badge>{formatDateTime(preview?.nextSendTime)}</Badge>
    </Group>
    <div>
      <Text fw={500} mb="xs">{t('previewLabels.message')}</Text>
      <Paper withBorder radius="md" p="sm">
        <ScrollArea style={{ maxHeight: 400 }}>
          <Markdown remarkPlugins={[remarkGfm, remarkBreaks]}>{preview?.message ?? ''}</Markdown>
        </ScrollArea>
      </Paper>
    </div>
    <Group justify="flex-end">
      <Button variant="default" onClick={handleClose}>{t('button.close')}</Button>
    </Group>
  </>;
}