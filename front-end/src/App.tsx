import { Provider } from 'react-redux';
import './App.css'
import AuthProvider from "./providers/authProvider";
import Routes from './routes';
import { store } from './stores/store';

function App() {
  return (
    <AuthProvider>
      <Provider store={store}>
        <Routes />
      </Provider>
    </AuthProvider>
  )
}

export default App
