import { FC, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "../stores/store";
import apiClient from "../utils/apiClient";
import { resetAuthData, updateAuthData } from "../stores/slices";

export const AuthHeaderInjector: FC = () => {
  const dispatch = useAppDispatch();
  const token = useSelector((state: RootState) => (state.auth.token));

  useEffect(() => {
    const requestInterceptor = apiClient.interceptors.request.use(
      async (config) => {
        const accessToken = token;
        if (accessToken && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      }
    );

    const responseInterceptor = apiClient.interceptors.response.use(
      (response) => {
        const accessToken = response?.data['access_token'];
        if (accessToken) {
          dispatch(updateAuthData(accessToken));
        }
        return response;
      },
      async (error) => {
        if (error.response && error.response.status === 401) {
          dispatch(resetAuthData());
        }
        return Promise.reject(error);
      }
    );

    return () => {
      apiClient.interceptors.request.eject(requestInterceptor);
      apiClient.interceptors.response.eject(responseInterceptor);
    };
  }, [token, dispatch]);

  return null;
};