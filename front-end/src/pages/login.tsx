import { FC, FormEvent, useState } from 'react'
import apiClient from '../utils/apiClient';
import { useAuth } from '../providers/authProvider';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Grid, Header, InputOnChangeData, Message, Segment } from 'semantic-ui-react';

export const LoginPage: FC = () => {
  const { setToken } = useAuth();
  const navigate = useNavigate();

  const [loginForm, setloginForm] = useState({
    username: "",
    password: ""
  });

  const [formError, setFormError] = useState('')

  function handleChange(_: unknown, data: InputOnChangeData) { 
    const { value, name } = data;
    setloginForm(prevNote => ({
      ...prevNote, [name]: value
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    apiClient.post("auth/login", {
        username: loginForm.username,
        password: loginForm.password
      }).then((response) => {
      const data = response.data;
      if (data.success) {
        setToken(response.data.access_token);
        navigate("/", { replace: true });
      } else {
        setFormError(data.error);
      }
    }).catch((error) => {
      if (error.response?.data?.error) {
        setFormError(error.response.data.error);
      }
    });

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
        <Form size='large' onSubmit={handleSubmit} error={Boolean(formError)}>
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
          <Message error content={formError} />
          <Button color='teal' fluid size='large'>Login</Button>
        </Form>
      </Segment>
    </Grid.Column>
  </Grid>
  );
}