import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'
import { Container } from 'reactstrap';
import AuthProvider from "./providers/authProvider";
import Routes from './routes';
import { Header } from './components/header';

function App() {
  return (
    <Container className='bg-dark' fluid style={{ height: '100vh'}}>
      <AuthProvider>
        <Header />
        <Routes />
      </AuthProvider>
    </Container>
  )
}

export default App
