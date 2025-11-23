import { createSearchParams } from "react-router-dom";

export function generatePasswordResetLink(userName: string, token: string): string {
  const search = createSearchParams({
      username: userName,
      token: token,
  }).toString();
  return `/changePassword?${search}`;
};

export function getApiBaseUrl(): string {
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = window.location.port;
  return `${protocol}//${hostname}${port ? ':' + port : ''}`;
};
