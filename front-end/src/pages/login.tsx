import { FC, useEffect } from 'react'
import { login } from '../stores/thunks';
import { RootState, useAppDispatch } from '../stores/store';
import { connect } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, PasswordInput, TextInput } from '@mantine/core';
import { useFormHandler } from '../hooks';
import { loginSchema, LoginType } from '../schemas';
import { useLoading } from '../providers';
import { ErrorMessage } from '../components';

type ComponentProps = {
  loading: boolean;
  error?: string;
  token: string | null;
};

const mapStateToProps = (state: RootState): ComponentProps => ({
  loading: state.auth.loading,
  error: state.auth.error,
  token: state.auth.token,
});

const Component: FC<ComponentProps> = ({ loading, error, token }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { setLoading } = useLoading();

  const returnUrl = new URLSearchParams(location.search).get("returnUrl") || "/";

  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      navigate(returnUrl.endsWith('notAllowed') ? "/" : returnUrl, { replace: true });
    }
  }, [token, returnUrl, navigate]);

  useEffect(() => {
    setLoading(loading);
  }, [loading, setLoading]);

  const changePassword = async (data: LoginType) => {
    dispatch(login({
      username: data.username,
      password: data.password,
    }));
  };

  const {
    handleFormSubmit,
    registerControl,
    isValid,
  } = useFormHandler<LoginType>({
    formKey: 'login',
    isEdit: false,
    cleanupAction: () => {},
    fetchDataAction: () => {},
    saveAction: changePassword,
    validationSchema: loginSchema,
  });

  return <form onSubmit={handleFormSubmit}>
      <TextInput
        placeholder={'User name'}
        required
        radius="md"
        {...registerControl('username')}
      />
      <PasswordInput
        placeholder={'Password'}
        required
        mt="md"
        radius="md"
        {...registerControl('password')}
      />
      <ErrorMessage content={error} ta="center" size="sm" />

      <Button type='submit' fullWidth mt="xl" radius="md" disabled={!isValid}>
        {'Log in'}
      </Button>
    </form>;
};

export const LoginPage = connect(mapStateToProps)(Component);