import { Navigate } from "react-router-dom";
import { RootState, useAppSelector } from "../stores/store";
import { AuthenticatedLayout } from "../layouts/authenticatedLayout";
import { PageHeaderContentProvider } from "../providers";

export const ProtectedRoute = () => {
  const token = useAppSelector((state: RootState) => state.auth.token);

  if (!token) {
    return <Navigate to={`/login?returnUrl=${encodeURIComponent(location.pathname)}`} />;
  }

  return <PageHeaderContentProvider>
      <AuthenticatedLayout/>
    </PageHeaderContentProvider>;
};
