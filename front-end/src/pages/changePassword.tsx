import { FC, SetStateAction, useEffect, useState } from 'react'
import { useAppDispatch } from '../stores/store';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PasswordEdit, passwordEditSchema } from '../schemas';
import { changePassword } from '../stores/thunks';
import { useFormHandler } from '../hooks';
import { Button, PasswordInput, Text } from '@mantine/core';
import { ErrorMessage } from '../components';
import { logout } from '../stores/slices';
import { usePageTranslation } from '../utils';

export const ChangePasswordPage: FC = () => {
  const [ error, setError ] = useState<string | null>(null);
  const [ success, setSuccess ] = useState<boolean>(false);
  const [ searchParams ] = useSearchParams();
  const username = searchParams.get('username');
  const token = searchParams.get('token');
  const t = usePageTranslation('common');

  const invalidRequest = !username || !token;

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleSave = (data: PasswordEdit) => {
    dispatch(changePassword({
      resetToken: token!,
      newPassword: data.repeatNewPassword
    }))
      .unwrap()
      .then(() => {
        dispatch(logout());
        setSuccess(true);
        setError(null);
      })
      .catch((e: SetStateAction<string | null>) => {
        setError(e);
        setSuccess(false);
      });
  };

  const {
    handleFormSubmit,
    registerControl,
    isValid,
    renderField,
  } = useFormHandler<PasswordEdit>({
    formKey: 'changePassword',
    isEdit: false,
    cleanupAction: () => {},
    fetchDataAction: () => {},
    saveAction: handleSave,
    validationSchema: passwordEditSchema,
    errorFormatter: (error) => t(error),
    defaultRender: (name, title) => <PasswordInput
        placeholder={title}
        disabled={invalidRequest || success}
        required
        {...registerControl(name)}
        pb='sm'
      />,
    fields: [
      {
        name: 'newPassword',
        title: t('changePassword.newPassword'),
        required: true,
      },
      {
        name: 'repeatNewPassword',
        title: t('changePassword.repeatNewPassword'),
        required: true,
      }
    ]
  });

  useEffect(() => {
    setTimeout(() => setError(invalidRequest ? t('changePassword.invalidRequest') : null), 0);
  }, [invalidRequest, t]);

  if (success) {
    return <>
      <Text size="lg" fw={500} ta="center" c="green" mb="md">
        {t('changePassword.successTitle')}
      </Text>
      <Text size="sm" ta="center" mb="md">
        {t('changePassword.successBody')}
      </Text>
      <Button fullWidth mt="xl" radius="md" onClick={() => navigate('/login')}>
        {t('changePassword.goToLogin')}
      </Button>
    </>;
  }

  return <form onSubmit={handleFormSubmit}>
      <Text size="sm" c="dimmed" mb="md" ta="center">
          {t('changePassword.intro')}
        </Text>
      {renderField('newPassword')}
      {renderField('repeatNewPassword')}
      <ErrorMessage content={error} ta="center" size="sm"/>
      <Button type='submit' fullWidth mt="xl" radius="md" disabled={!isValid || invalidRequest}>
        {t('changePassword.setPassword')}
      </Button>
    </form>;
};
