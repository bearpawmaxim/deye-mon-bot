import { FC, useState } from "react";
import CodeMirror, { basicSetup } from '@uiw/react-codemirror';
import { langs } from '@uiw/codemirror-extensions-langs';
import { Button, Form, Modal, ModalActions, ModalContent, ModalDescription, ModalHeader, TextArea } from "semantic-ui-react";
import { autocompletion } from "@codemirror/autocomplete";
import { jinja2Autocomplete } from "../../../utils";

type ComponentProps = {
  template?: string;
  onChange: (template: string) => void;
  renderTemplate: () => string;
};

const Component: FC<ComponentProps> = ({ template, onChange }: ComponentProps) => {
  const [opened, setOpened] = useState(false);

  return <>
    <Form.Field>
      <CodeMirror
        value={template}
        theme={"dark"}
        spellCheck={true}
        extensions={[
          basicSetup(),
          langs.jinja2(),
          langs.markdown(),
          autocompletion({
            override: [jinja2Autocomplete],
          }),
        ]}
        onChange={(value) => onChange(value)}
      />
    </Form.Field>
    {/* <Form.Button content='Test' color='orange' onClick={() => setOpened(true)} /> */}
    <Modal open={opened}>
      <ModalHeader>Template test</ModalHeader>
      <ModalContent>
        <ModalDescription>
          <Form>
            <TextArea readOnly style={{ minHeight: 150, width: '100%' }}
            />
          </Form>
        </ModalDescription>
      </ModalContent>
      <ModalActions>
        <Button color='black' content='Close' onClick={() => setOpened(false)} />
      </ModalActions>
    </Modal>
  </>
}

export const TemplateEditor = Component;