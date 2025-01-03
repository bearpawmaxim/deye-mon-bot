import { FC, useEffect } from "react";
import { Button, Label, Message, Modal, ModalActions, ModalContent, ModalHeader, Segment } from "semantic-ui-react";
import { RootState, useAppDispatch } from "../../../stores/store";
import { getTemplatePreview } from "../../../stores/thunks";
import { TemplatePreview } from "../../../stores/types";
import { connect } from "react-redux";
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from "remark-breaks";

type MessagePreviwOwnProps = {
  shown: boolean;
  setShown: (shown: boolean) => void;
};

type MessagePreviewStateProps = {
  preview?: TemplatePreview;
  loading: boolean;
  error?: string;
};

type ComponentProps = MessagePreviewStateProps & MessagePreviwOwnProps;

const mapStateToProps = (state: RootState, ownProps: MessagePreviwOwnProps): ComponentProps => ({
  shown: ownProps.shown,
  setShown: ownProps.setShown,
  preview: state.messages.templatePreview,
  loading: state.messages.loadingPreview,
  error: state.messages.previewError,
});

const Component: FC<ComponentProps> = ({ shown, setShown, preview, loading, error }) => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (shown) {
      dispatch(getTemplatePreview());
    }
  }, [shown]);

  return <Modal
    onClose={() => setShown(false)}
    onOpen={() => setShown(true)}
    open={shown}
    trigger={<Button size="tiny" color='orange' content='Preview' />}
    >
    <ModalHeader>Message preview</ModalHeader>
    <ModalContent>
      <Segment basic loading={loading}>
        {Boolean(error) && <Message error>{error}</Message>}
        Should send: <Label color={(preview?.shouldSend ?? false) ? 'teal' : 'orange'} content={(preview?.shouldSend ?? false) ? 'YES' : 'NO'} /><br/>
        Timeout (seconds): <Label content={preview?.timeout} /><br/>
        Message:
        <Segment inverted>
          <Markdown remarkPlugins={[remarkGfm, remarkBreaks]}>{preview?.message}</Markdown>
        </Segment>
      </Segment>
    </ModalContent>
    <ModalActions>
      <Button color='black' onClick={() => setShown(false)} content='Close'/>
    </ModalActions>
  </Modal>
};

export const MessagePreview = connect(mapStateToProps)(Component);