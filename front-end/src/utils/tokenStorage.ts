export const getAccessToken = (): string => {
  return localStorage.getItem('access_token') as string;
}

export const getRefreshToken = (): string => {
  return localStorage.getItem('refresh_token') as string;
}

export const removeTokens = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
}
