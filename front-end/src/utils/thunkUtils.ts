export function getErrorMessage(error: unknown, fallback = 'Unexpected error'): string {
  return (error as Record<string, string>)['message'] ?? fallback;
}
