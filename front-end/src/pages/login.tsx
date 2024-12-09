import 'bootstrap/dist/css/bootstrap.min.css';
import { ChangeEvent, FC, FormEvent, useState } from 'react'
import { Button, Card, CardBody, Col, Container, Form, FormFeedback, FormGroup, Input, Row } from 'reactstrap'
import apiClient from '../utils/apiClient';
import { useAuth } from '../providers/authProvider';
import { useNavigate } from 'react-router-dom';


export const LoginPage: FC = () => {
  const { setToken } = useAuth();
  const navigate = useNavigate();

  const [loginForm, setloginForm] = useState({
    username: "",
    password: ""
  });

  const [formError, setFormError] = useState('')

  function handleChange(event: ChangeEvent<HTMLInputElement>) { 
    const { value, name } = event.target
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
      if (error.response) {
        console.log(error.response);
        console.log(error.response.status);
        console.log(error.response.headers);
        setFormError(error.response.data.error);
      }
    });

    setloginForm({
      username: "",
      password: ""
    });

    event.preventDefault();
  }
 
  return (
    <Container className='bg-dark' fluid style={{ height: '100vh'}}>
      <Row className='d-flex justify-content-center align-items-center h-100'>
        <Col sm='12'>
          <Card className='my-5 mx-auto' style={{borderRadius: '1rem', maxWidth: '500px'}}>
            <CardBody className='p-5 d-flex flex-column align-items-center mx-auto w-100 h-100'>
              <h3 className="fw-bold mb-2 text-uppercase">Login</h3>
              <p className="text-black-50 mb-5">Please enter your login and password</p>
              <Form onSubmit={handleSubmit} className='w-100'>
                <FormGroup>
                  <Input onChange={handleChange} type="text" name="username" placeholder="User name" value={loginForm.username} required />
                </FormGroup>
                <FormGroup>
                  <Input onChange={handleChange} type="password" name="password" placeholder="Password" value={loginForm.password} required />
                </FormGroup>
                <FormGroup>
                  <Row>
                    <Col sm={8}>
                      { Boolean(formError) ?
                        <>
                          <Input hidden invalid/>
                          <FormFeedback invalid>
                            { formError }
                          </FormFeedback>
                        </>
                      : <></> }
                    </Col>
                    <Col sm={4}>
                      <Button type="submit" color="primary" className='float-end'>Login</Button>
                    </Col>
                  </Row>
                </FormGroup>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}