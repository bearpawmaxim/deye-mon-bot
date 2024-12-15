import { RouteObject, RouterProvider, createBrowserRouter } from "react-router-dom";
import { useAuth } from "../providers/authProvider";
import { ProtectedRoute } from "./protectedRoute";
import { LoginPage, HomePage, ChannelsPage, StationsPage, BotsPage, ChatsPage } from "../pages";
import AuthenticatedLayout from "../layouts/authenticatedLayout";
import { PageHeaderButtonsProvider } from "../providers";

export type MenuItem = RouteObject & {
  children?: MenuItem[];
  name?: string;
}

export const RootRoutes: MenuItem[] = [
  {
    path: "/",
    name: "Home",
    Component: HomePage,
  },
  {
    path: "/bots",
    name: "Bots",
    Component: BotsPage,
  },
  {
    path: "/stations",
    name: "Stations",
    Component: StationsPage,
  },
  {
    path: "/channels",
    name: "Channels",
    Component: ChannelsPage,
  },
  {
    path: "/chats",
    name: "Chats",
    Component: ChatsPage,
  }
];

const Routes = () => {
  const { token } = useAuth();

  const routesForAuthenticatedOnly: MenuItem[] = [
    {
      path: "/",
      element: (<ProtectedRoute>
          <PageHeaderButtonsProvider>
            <AuthenticatedLayout />
          </PageHeaderButtonsProvider>
        </ProtectedRoute>),
      children: RootRoutes,
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
