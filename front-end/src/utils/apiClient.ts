import axios from 'axios';
import { logout } from '../stores/thunks';
import { StoreType } from '../stores/store';
import { NavigateFunction } from 'react-router-dom';

const apiClient = axios.create({
  baseURL: '/api',
});

export const setAuthorizationHeader = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export const setupResponseInterceptor = (store: StoreType, navigate: NavigateFunction) => {
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        store.dispatch(logout());
        navigate('/login');
      }
      return Promise.reject(error);
    }
  );
};

export default apiClient;