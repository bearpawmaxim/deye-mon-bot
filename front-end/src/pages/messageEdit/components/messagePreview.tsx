import { FC, useEffect } from "react";
import { RootState, useAppDispatch, useAppSelector } from "../../../stores/store";
import { getTemplatePreview } from "../../../stores/thunks";
import { TemplatePreview } from "../../../stores/types";
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from "remark-breaks";
import { Button, Paper, Text, Group, Badge, Loader, Stack, ScrollArea } from '@mantine/core'
import { modals } from '@mantine/modals'

type OpenMessagePreviewOptions = {
  name: string,
  stations: number[];
  shouldSendTemplate: string;
  timeoutTemplate: string;
  messageTemplate: string;
};

export function openMessagePreviewDialog({
  name,
  stations,
  shouldSendTemplate,
  timeoutTemplate,
  messageTemplate,
}: OpenMessagePreviewOptions) {
  const Inner: FC = () => {
    const dispatch = useAppDispatch();
    const preview = useAppSelector((s: RootState) => s.messages.templatePreview) as TemplatePreview | undefined;
    const loading = useAppSelector((s: RootState) => s.messages.loadingPreview) as boolean;
    const error = useAppSelector((s: RootState) => s.messages.previewError) as string | undefined;

    useEffect(() => {
      dispatch(getTemplatePreview({ name, stations, shouldSendTemplate, timeoutTemplate, messageTemplate }));
    }, [dispatch]);

    const handleClose = () => {
      if (id) {
        modals.close(id);
      }
    };

    return (
      <Stack gap="xs">
        {loading ? (
          <Group justify="center"><Loader /></Group>
        ) : (
          <Stack gap="xs">
            {error && <Text color="red">{error}</Text>}
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
          </Stack>
        )}
      </Stack>
    );
  };

  const id: string | undefined = modals.open({
    title: `Message '${name}' preview`,
    centered: true,
    size: 'lg',
    children: <Inner />,
  });
}