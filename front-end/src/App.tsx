import { Provider } from 'react-redux';
import './App.css'
import Routes from './routes';
import { store } from './stores/store';
import { AuthHeaderInjector } from './components';

function App() {
  return (
    <Provider store={store}>
      <AuthHeaderInjector />
      <Routes />
    </Provider>
  )
}

export default App
