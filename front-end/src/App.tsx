import { Provider } from 'react-redux';
import './App.css'
import Routes from './routes';
import { store } from './stores/store';
import { AuthHeaderInjector } from './components';
import { MantineProvider } from '@mantine/core';
import theme from './theme';
import { LoadingProvider } from './providers';
import { ModalsProvider } from '@mantine/modals';

function App() {
  return (
    <Provider store={store}>
      <MantineProvider defaultColorScheme="dark" theme={theme}>
        <ModalsProvider>
          <LoadingProvider>
            <AuthHeaderInjector />
            <Routes />
          </LoadingProvider>
        </ModalsProvider>
      </MantineProvider>
    </Provider>
  )
}

export default App
