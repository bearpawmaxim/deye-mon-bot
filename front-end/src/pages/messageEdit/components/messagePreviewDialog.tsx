import { FC, useEffect } from "react";
import { RootState, useAppDispatch } from "../../../stores/store";
import { getTemplatePreview } from "../../../stores/thunks";
import { TemplatePreview } from "../../../stores/types";
import { Text, Group, Loader, Stack } from '@mantine/core'
import { modals } from '@mantine/modals'
import { connect } from "react-redux";
import { MessagePreview } from "./messagePreview";
import { ObjectId } from "../../../schemas";

type OpenMessagePreviewOptions = {
  name: string,
  stations: ObjectId[];
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

  type InnerProps = {
    templatePreview?: TemplatePreview;
    loadingPreview: boolean;
    previewError?: string;
  };

  const mapStateToProps = (state: RootState): InnerProps => ({
    templatePreview: state.messages.templatePreview,
    loadingPreview: state.messages.loadingPreview,
    previewError: state.messages.previewError,
  });

  const Inner: FC<InnerProps> = ({ 
    templatePreview,
    loadingPreview,
    previewError,
   }) => {
    const dispatch = useAppDispatch();

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
        {loadingPreview ? (
          <Group justify="center"><Loader /></Group>
        ) : (
          <Stack gap="xs">
            {previewError && <Text c="red">{previewError}</Text>}
            {!previewError && <MessagePreview
                handleClose={handleClose}
                preview={templatePreview!}
              />}
          </Stack>
        )}
      </Stack>
    );
  };

  const ConnectedInner = connect(mapStateToProps)(Inner);

  const id: string | undefined = modals.open({
    title: `Message '${name}' preview`,
    centered: true,
    size: 'lg',
    children: <ConnectedInner />,
  });
}