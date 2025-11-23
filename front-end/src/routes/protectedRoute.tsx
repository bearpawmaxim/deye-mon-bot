import { Navigate } from "react-router-dom";
import { useAppSelector } from "../stores/store";
import { AuthenticatedLayout } from "../layouts/authenticatedLayout";
import { PageHeaderContentProvider } from "../providers";
import { authDataSelector } from "../stores/selectors";

export const ProtectedRoute = () => {
  const authData = useAppSelector(authDataSelector);

  if (!authData?.accessToken) {
    return <Navigate to={`/login?returnUrl=${encodeURIComponent(location.pathname)}`} />;
  }

  return <PageHeaderContentProvider>
      <AuthenticatedLayout/>
    </PageHeaderContentProvider>;
};
