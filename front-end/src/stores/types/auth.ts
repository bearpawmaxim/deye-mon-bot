import { ProfileEdit } from "../../schemas";
import { AuthData } from "../../types";

export type ProfileData = {
  userId: string;
  userName: string;
};

export type UpdateAuthDataPayload = {
  authData: AuthData;
  isRefresh: boolean;
};

export type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error?: string;
  profile?: ProfileData;
  editingProfile?: ProfileEdit;
};