import { RouteObject, RouterProvider, createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./protectedRoute";
import { LoginPage, HomePage, StationsPage, BotsPage,
  ChatsPage, MessagesPage, MessageEditPage } from "../pages";
import { FC } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../stores/store";

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

const Routes: FC = () => {
  const token = useSelector<RootState>(state => state.auth.token);

  const loginRoute = {
    path: "/login",
    Component: LoginPage,
  } as RouteObject;

  const routesForAuthenticatedOnly: MenuItem[] = [
    loginRoute,
    {
      path: "/",
      element: (<ProtectedRoute/>),
      children: RootRoutes,
    },
  ];

  const routesForNotAuthenticated: RouteObject[] = [
    loginRoute
  ];

  const router = createBrowserRouter([
    ...(!token ? routesForNotAuthenticated : []),
    ...routesForAuthenticatedOnly,
  ]);

  return <RouterProvider router={router} />;
};

export default Routes;
