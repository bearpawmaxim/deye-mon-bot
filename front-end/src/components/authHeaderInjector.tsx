import { FC, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../stores/store";
import apiClient from "../utils/apiClient";
import { resetAuthData, updateAuthData } from "../stores/slices";
import { AuthData } from "../types";
import { authDataSelector } from "../stores/selectors";
import axios from "axios";

export const AuthHeaderInjector: FC = () => {
  const dispatch = useAppDispatch();
  const authData = useAppSelector(authDataSelector);

  const refreshToken = async (authData: AuthData): Promise<AuthData | null> => {
    try {
      const response = await axios.post(
        'api/auth/refresh',
        null,
        {
          headers: {
            Authorization: `Bearer ${authData.refreshToken}`
          }
        }
      );
      return response.data;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const requestInterceptor = apiClient.interceptors.request.use(
      async (config) => {
        if (authData.accessToken && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${authData.accessToken}`;
        }
        return config;
      }
    );

    const responseInterceptor = apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response && error.response.status === 401) {
          if (authData.refreshToken && authData.accessToken) {
            try {
              const refreshResult = await refreshToken(authData)
              if (refreshResult && refreshResult.accessToken) { 
                error.config.headers.Authorization = `Bearer ${refreshResult.accessToken}`;
                dispatch(updateAuthData({ authData: refreshResult, isRefresh: true, }));
                return apiClient.request(error.config);
              }
            } catch(refreshError) {
              dispatch(resetAuthData());
              throw refreshError;
            }
          } else {
            dispatch(resetAuthData());
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      apiClient.interceptors.request.eject(requestInterceptor);
      apiClient.interceptors.response.eject(responseInterceptor);
    };
  }, [authData, dispatch]);

  return null;
};