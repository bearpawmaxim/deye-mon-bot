import { Provider } from 'react-redux';
import './App.css'
import Routes from './routes';
import { store } from './stores/store';
import { AuthHeaderInjector } from './components';
import { MantineProvider } from '@mantine/core';
import theme from './theme';
import { DatesProviderWrapper, LoadingProvider } from './providers';
import { ModalsProvider } from '@mantine/modals';
import { setLanguageHeader } from './utils';
import { useEffect } from 'react';
import i18n from './i18n';

function App() {
  useEffect(() => {
    setLanguageHeader(i18n.language);

    const handler = (lng: string) => {
      setLanguageHeader(lng);
      localStorage.setItem('lang', lng);
    };

    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, []);

  return (
    <Provider store={store}>
      <MantineProvider defaultColorScheme="dark" theme={theme}>
        <ModalsProvider>
          <DatesProviderWrapper>
            <LoadingProvider>
              <AuthHeaderInjector />
              <Routes />
            </LoadingProvider>
          </DatesProviderWrapper>
        </ModalsProvider>
      </MantineProvider>
    </Provider>
  )
}

export default App
