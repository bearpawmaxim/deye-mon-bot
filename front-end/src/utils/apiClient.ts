import axios from 'axios';
import { logout } from '../stores/thunks';
import { StoreType } from '../stores/store';

const apiClient = axios.create({
  baseURL: '/api',
});

export const setAuthorizationHeader = (token: string | undefined) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export const setupResponseInterceptor = (store: StoreType, navigate: any) => {
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