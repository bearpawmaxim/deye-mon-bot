export const getToken = (): string => {
  return localStorage.getItem('token') as string;
}

export const removeToken = (): void => {
  localStorage.removeItem('token');
}

export const setToken = (token: string) => {
  localStorage.setItem('token', token);
}
    