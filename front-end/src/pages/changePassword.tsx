import { FC, SetStateAction, useEffect, useState } from 'react'
import { useAppDispatch } from '../stores/store';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PasswordEdit, passwordEditSchema } from '../schemas';
import { changePassword, logout } from '../stores/thunks';
import { useFormHandler } from '../hooks';
import { Button, PasswordInput } from '@mantine/core';
import { ErrorMessage } from '../components';

export const ChangePasswordPage: FC = () => {
  const [ error, setError ] = useState<string | null>(null);
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
        navigate('/login');
      })
      .catch((e: SetStateAction<string | null>) => {
        setError(e);
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
        disabled={invalidRequest}
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

  return <form onSubmit={handleFormSubmit}>
      {renderField('newPassword')}
      {renderField('repeatNewPassword')}
      <ErrorMessage content={error} ta="center" size="sm"/>
      <Button type='submit' fullWidth mt="xl" radius="md" disabled={!isValid}>
        ChangePassword
      </Button>
    </form>;
};
