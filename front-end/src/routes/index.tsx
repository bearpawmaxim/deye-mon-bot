import { RouteObject, RouterProvider, createBrowserRouter } from "react-router-dom";
import { useAuth } from "../providers/authProvider";
import { ProtectedRoute } from "./protectedRoute";
import { LoginPage } from "../pages/login";
import { HomePage } from "../pages/home";

const Routes = () => {
  const { token } = useAuth();

  const routesForAuthenticatedOnly: RouteObject[] = [
    {
      path: "/",
      element: <ProtectedRoute />,
      children: [
        {
          path: "/",
          Component: HomePage,
        },
      ],
    },
  ];

  const routesForNotAuthenticated: RouteObject[] = [
    {
      path: "/login",
      Component: LoginPage,
    } as RouteObject,
  ];

  const router = createBrowserRouter([
    ...(!token ? routesForNotAuthenticated : []),
    ...routesForAuthenticatedOnly,
  ]);

  return <RouterProvider router={router} />;
};

export default Routes;
