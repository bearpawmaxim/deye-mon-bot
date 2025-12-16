import { AxiosError } from "axios";

export function getErrorMessage(error: unknown, fallback = 'Unexpected error'): string {
  let message = null;
  if (error instanceof AxiosError) {
    message = error.response?.data?.detail as string;
  }
  return message ?? (error as Record<string, string>)['message'] ?? fallback;
}
