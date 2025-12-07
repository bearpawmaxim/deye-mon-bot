import { FC, SetStateAction, useEffect, useState } from 'react'
import { useAppDispatch } from '../stores/store';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PasswordEdit, passwordEditSchema } from '../schemas';
import { changePassword } from '../stores/thunks';
import { useFormHandler } from '../hooks';
import { Button, PasswordInput, Text } from '@mantine/core';
import { ErrorMessage } from '../components';
import { logout } from '../stores/slices';

export const ChangePasswordPage: FC = () => {
  const [ error, setError ] = useState<string | null>(null);
  const [ success, setSuccess ] = useState<boolean>(false);
  const [ searchParams ] = useSearchParams();
  const username = searchParams.get('username');
  const token = searchParams.get('token');

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
        title: 'New password',
        required: true,
      },
      {
        name: 'repeatNewPassword',
        title: 'Repeat new password',
        required: true,
      }
    ]
  });

  useEffect(() => {
    setTimeout(() => setError(invalidRequest ? 'Invalid request' : null), 0);
  }, [invalidRequest]);

  if (success) {
    return <>
      <Text size="lg" fw={500} ta="center" c="green" mb="md">
        Password successfully changed!
      </Text>
      <Text size="sm" ta="center" mb="md">
        You can now log in with your new password.
      </Text>
      <Button fullWidth mt="xl" radius="md" onClick={() => navigate('/login')}>
        Go to Login
      </Button>
    </>;
  }

  return <form onSubmit={handleFormSubmit}>
      <Text size="sm" c="dimmed" mb="md" ta="center">
        Welcome! Please set your password to access your account.
      </Text>
      {renderField('newPassword')}
      {renderField('repeatNewPassword')}
      <ErrorMessage content={error} ta="center" size="sm"/>
      <Button type='submit' fullWidth mt="xl" radius="md" disabled={!isValid || invalidRequest}>
        Set Password
      </Button>
    </form>;
};
