import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Group } from "@mantine/core";
import { FC } from "react";

export type FormSubmitButtonsProps = {
  isDirty: boolean;
  isValid: boolean;
  isEdit: boolean;
  handleReset: () => void;
};

export const FormSubmitButtons: FC<FormSubmitButtonsProps> = ({
  isDirty,
  isEdit,
  isValid,
  handleReset,
}) => {
  return <Group justify="flex-start">
    <Button
      type="submit"
      color="green.9"
      disabled={!isDirty || !isValid}
      leftSection={<FontAwesomeIcon icon='save' />}
    >
      Save
    </Button>
    <Button
      type="button"
      color="black"
      onClick={handleReset}
      disabled={!isDirty || !isEdit}
      leftSection={<FontAwesomeIcon icon='cancel' />}
    >
      Cancel
    </Button>
  </Group>;
};