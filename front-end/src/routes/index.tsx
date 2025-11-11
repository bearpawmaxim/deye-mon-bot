import { RouteObject, RouterProvider, createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./protectedRoute";
import { LoginPage, HomePage, StationsPage, BotsPage,
  ChatsPage, MessagesPage, MessageEditPage, PublicPage } from "../pages";
import { FC } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../stores/store";
import { IconName } from "@fortawesome/fontawesome-svg-core";
import { AnonymousLayout } from "../layouts/anonymousLayout";

export type MenuItem = RouteObject & {
  children?: MenuItem[];
  name?: string;
  icon?: IconName;
  skipForMenu?: boolean;
}

const publicPage = {
  path: "/public",
  element: <PublicPage />,
};

// eslint-disable-next-line react-refresh/only-export-components
export const RootRoutes: MenuItem[] = [
  {
    path: "/",
    name: "Home",
    icon: "home",
    Component: HomePage,
  },
  {
    path: "/bots",
    name: "Bots",
    icon: "robot",
    Component: BotsPage,
  },
  {
    path: "/stations",
    name: "Stations",
    icon: "tower-broadcast",
    Component: StationsPage,
  },
  {
    path: "/messages",
    name: "Messages",
    icon: "envelope",
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
    icon: "comments",
    Component: ChatsPage,
  },
  {
    ...publicPage,
    icon: "building",
    name: "Buildings",
  }
];

const Routes: FC = () => {
  const token = useSelector<RootState>(state => state.auth.token);

  const loginRoute = {
    path: "/login",
    element: (<AnonymousLayout caption="Log in to your account">
      <LoginPage/>
    </AnonymousLayout>),
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
    loginRoute,
    publicPage,
  ];

  const router = createBrowserRouter([
    ...(!token ? routesForNotAuthenticated : []),
    ...routesForAuthenticatedOnly,
  ]);

  return <RouterProvider router={router} />;
};

export default Routes;
