import { RouteObject, RouterProvider, createBrowserRouter } from "react-router-dom";
import { useAuth } from "../providers/authProvider";
import { ProtectedRoute } from "./protectedRoute";
import { LoginPage, HomePage, StationsPage, BotsPage, ChatsPage, MessagesPage, MessageEditPage } from "../pages";
import AuthenticatedLayout from "../layouts/authenticatedLayout";
import { PageHeaderContentProvider } from "../providers";

export type MenuItem = RouteObject & {
  children?: MenuItem[];
  name?: string;
  skipForMenu?: boolean;
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
    path: "/messages",
    name: "Messages",
    Component: MessagesPage,
  },
  {
    path: "/messages/edit/:messageId",
    name: "Editing message",
    element: <MessageEditPage isEdit={true} />,
    skipForMenu: true,
  },
  {
    path: "/messages/create",
    name: "Creating a new message",
    element: <MessageEditPage isEdit={false} />,
    skipForMenu: true,
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
          <PageHeaderContentProvider>
            <AuthenticatedLayout />
          </PageHeaderContentProvider>
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
