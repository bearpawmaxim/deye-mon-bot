import { ProfileEdit } from "../../schemas";

export type ProfileData = {
  userId: number;
  userName: string;
};

export type AuthState = {
  token: string | null;
  loading: boolean;
  error?: string;
  profile?: ProfileData;
  editingProfile?: ProfileEdit;
};