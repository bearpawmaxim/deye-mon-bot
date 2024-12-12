import { Navigate } from "react-router-dom";
import { useAuth } from "../providers/authProvider";
import { ReactNode } from "react";

type ProtectedRouteProps = {
  children?: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { token } = useAuth();
  
  if (!token) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};
