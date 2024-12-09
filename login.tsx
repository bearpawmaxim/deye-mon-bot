import 'bootstrap/dist/css/bootstrap.min.css';
import { FormEvent } from 'react'
import { useRouter } from 'next/router'
import { Button, Card, CardBody, Col, Container, Form, FormGroup, Input, Label, Row } from 'reactstrap'
 
export default function LoginPage() {
  const router = useRouter()
 
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
 
    const formData = new FormData(event.currentTarget)
    const username = formData.get('username')
    const password = formData.get('password')
 
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
 
    if (response.ok) {
      router.push('/home')
    } else {
      // Handle errors
    }
  }
 
  return (
    <Container className='bg-dark' fluid style={{ height: '100vh'}}>
      <Row className='d-flex justify-content-center align-items-center h-100'>
        <Col sm='12'>
          <Card className='my-5 mx-auto' style={{borderRadius: '1rem', maxWidth: '500px'}}>
            <CardBody className='p-5 d-flex flex-column align-items-center mx-auto w-100 h-100'>
              <h2 className="fw-bold mb-2 text-uppercase">Login</h2>
              <p className="text-black-50 mb-5">Please enter your login and password!</p>
              <Form onSubmit={handleSubmit} className='w-100'>
                <FormGroup floating>
                  <Input type="text" name="username" placeholder="User name" required />
                  <Label for="username">
                    User name
                  </Label>
                </FormGroup>
                <FormGroup floating>
                  <Input type="password" name="password" placeholder="Password" required />
                  <Label for="password">
                    Password
                  </Label>
                </FormGroup>
                <FormGroup>
                  <Button type="submit" color="primary" className='float-end'>Login</Button>
                </FormGroup>
              </Form>  
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}