import { ProfileEdit } from "../../schemas";

export type ProfileData = {
  userId: number;
  userName: string;
};

export type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error?: string;
  profile?: ProfileData;
  editingProfile?: ProfileEdit;
};