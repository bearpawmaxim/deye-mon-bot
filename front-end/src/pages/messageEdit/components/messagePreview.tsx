import { FC } from "react";
import { TemplatePreview } from "../../../stores/types";
import { Group, Badge, Paper, ScrollArea, Text, Button } from "@mantine/core";
import Markdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

type MessagePreviewProps = {
  handleClose: () => void;
  preview: TemplatePreview;
};

export const MessagePreview: FC<MessagePreviewProps> = ({ handleClose, preview }) => {
  return <>
    <Group>
      <Text fw={500}>Should send:</Text>
      <Badge color={(preview?.shouldSend ?? false) ? 'teal' : 'orange'}>{(preview?.shouldSend ?? false) ? 'YES' : 'NO'}</Badge>
    </Group>
    <Group>
      <Text fw={500}>Timeout (seconds):</Text>
      <Badge>{preview?.timeout}</Badge>
    </Group>
    <div>
      <Text fw={500} mb="xs">Message:</Text>
      <Paper withBorder radius="md" p="sm">
        <ScrollArea style={{ maxHeight: 400 }}>
          <Markdown remarkPlugins={[remarkGfm, remarkBreaks]}>{preview?.message ?? ''}</Markdown>
        </ScrollArea>
      </Paper>
    </div>
    <Group justify="flex-end">
      <Button variant="default" onClick={handleClose}>Close</Button>
    </Group>
  </>;
}