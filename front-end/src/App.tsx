import { Container } from 'semantic-ui-react';
import './App.css'
import AuthProvider from "./providers/authProvider";
import Routes from './routes';

function App() {
  return (
      <AuthProvider>
        <Routes />
      </AuthProvider>
  )
}

export default App
