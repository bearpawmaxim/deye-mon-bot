export type UserData = {
  name: string;
};

export type AuthState = {
  token: string | null;
  loading: boolean;
  error?: string;
  user?: UserData; 
};