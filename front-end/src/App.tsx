import { Provider } from 'react-redux';
import './App.css'
import Routes from './routes';
import { store } from './stores/store';
import { getToken } from './utils';
import { fetchUserData } from './stores/thunks';

function App() {
  if (getToken()) {
    store.dispatch(fetchUserData());
  }  

  return (
    <Provider store={store}>
      <Routes />
    </Provider>
  )
}

export default App
