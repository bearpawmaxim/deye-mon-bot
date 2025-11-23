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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AuthData } from '../types';
import { authDataSelector } from '../stores/selectors';

type ComponentProps = {
  loading: boolean;
  error?: string;
  authData: AuthData | null;
};

const mapStateToProps = (state: RootState): ComponentProps => ({
  loading: state.auth.loading,
  error: state.auth.error,
  authData: authDataSelector(state),
});

const Component: FC<ComponentProps> = ({ loading, error, authData }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { setLoading } = useLoading();

  const returnUrl = new URLSearchParams(location.search).get("returnUrl") || "/";

  useEffect(() => {
    if (authData?.accessToken) {
      navigate('/');
    }
  }, [authData, navigate]);

  useEffect(() => {
    if (authData?.accessToken) {
      navigate(returnUrl.endsWith('notAllowed') ? "/" : returnUrl, { replace: true });
    }
  }, [authData, returnUrl, navigate]);

  useEffect(() => {
    setLoading(loading);
  }, [loading, setLoading]);

  const changePassword = async (data: LoginType) => {
    dispatch(login({
      userName: data.userName,
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
        leftSection={<FontAwesomeIcon icon={'user-md'} />}
        {...registerControl('userName')}
      />
      <PasswordInput
        placeholder={'Password'}
        required
        mt="md"
        radius="md"
        leftSection={<FontAwesomeIcon icon={'key'} />}
        {...registerControl('password')}
      />
      <ErrorMessage content={error} ta="center" size="sm" />

      <Button type='submit' fullWidth mt="xl" radius="md" disabled={!isValid}>
        {'Log in'}
      </Button>
    </form>;
};

export const LoginPage = connect(mapStateToProps)(Component);