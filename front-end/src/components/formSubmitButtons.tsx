import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Group } from "@mantine/core";
import { FC } from "react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  return <Group justify="flex-end">
    <Button
      type="submit"
      color="green.9"
      disabled={!isDirty || !isValid}
      leftSection={<FontAwesomeIcon icon='save' />}
    >
      {t('button.save')}
    </Button>
    <Button
      type="button"
      color="black"
      onClick={handleReset}
      disabled={!isDirty || !isEdit}
      leftSection={<FontAwesomeIcon icon='cancel' />}
    >
      {t('button.cancel')}
    </Button>
  </Group>;
};