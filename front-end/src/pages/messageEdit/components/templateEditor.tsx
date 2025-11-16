import { FC } from "react";
import EditorView, { minimalSetup } from '@uiw/react-codemirror';
import { langs } from '@uiw/codemirror-extensions-langs';
import { autocompletion } from "@codemirror/autocomplete";
import { jinja2Autocomplete } from "../../../utils";
import { MessageType } from "../../../schemas";
import { Control, Controller, UseFormTrigger } from "react-hook-form";
import { ErrorMessage } from "../../../components";

type ComponentProps = {
  name: 'messageTemplate' | 'timeoutTemplate' | 'shouldSendTemplate';
  control: Control<MessageType>;
  trigger: UseFormTrigger<MessageType>;
};

const Component: FC<ComponentProps> = ({ name, control, trigger }: ComponentProps) => {
  return <>
    <Controller<MessageType>
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => 
        <>
        <EditorView
          className={error ? "cm-error" : undefined}
          theme={"dark"}
          onChange={(value) => {
            field.onChange(value);
            trigger(name);
          }}
          ref={field.ref}
          value={field.value as string}
          spellCheck={true}
          extensions={[
            minimalSetup(),
            langs.jinja2(),
            langs.markdown(),
            autocompletion({
              override: [jinja2Autocomplete],
            }),
          ]}
        />
        {error && <ErrorMessage pt={'xs'} content={error?.message} />}
        </>
      }
    />
  </>
}

export const TemplateEditor = Component;