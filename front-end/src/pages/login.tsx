import { FC, FormEvent, useEffect, useState } from 'react'
import { Button, Form, Grid, Header, InputOnChangeData, Message, Segment } from 'semantic-ui-react';
import { login } from '../stores/thunks';
import { RootState, useAppDispatch } from '../stores/store';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';

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
  const [loginForm, setloginForm] = useState({
    username: "",
    password: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token]);

  function handleChange(_: unknown, data: InputOnChangeData) { 
    const { value, name } = data;
    setloginForm(prevNote => ({
      ...prevNote, [name]: value
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    dispatch(login({
      username: loginForm.username,
      password: loginForm.password,
    }));
    setloginForm({
      username: loginForm.username,
      password: ""
    });
    event.preventDefault();
  }
 
  return (
    <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle' className='login-page'>
      <Grid.Column style={{ maxWidth: 450 }}>
      <Segment stacked inverted className='login-form'>
        <Header as='h2' color='teal' textAlign='center'>
          Log-in to your account
        </Header>
        <Form size='large' onSubmit={handleSubmit} error={Boolean(error)} loading={loading}>
          <Form.Input
            fluid
            icon='user'
            value={loginForm.username}
            onChange={handleChange}
            iconPosition='left'
            name='username'
            placeholder='User name'
          />
          <Form.Input
            fluid
            icon='lock'
            iconPosition='left'
            placeholder='Password'
            type='password'
            onChange={handleChange}
            name='password'
            value={loginForm.password}
          />
          <Message size='tiny' error content={error} />
          <Button color='teal' fluid size='large'>Login</Button>
        </Form>
      </Segment>
    </Grid.Column>
  </Grid>
  );
};

export const LoginPage = connect(mapStateToProps)(Component);