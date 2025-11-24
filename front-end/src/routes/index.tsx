import { Navigate, RouteObject, RouterProvider, createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./protectedRoute";
import { LoginPage, HomePage, StationsPage, StationDetailsPage, BotsPage,
  ChatsPage, MessagesPage, MessageEditPage, UsersPage, 
  BuildingsPage, ExtDataPage, NotFoundPage, 
  ChangePasswordPage} from "../pages";
import { FC } from "react";
import { useAppSelector } from "../stores/store";
import { IconName } from "@fortawesome/fontawesome-svg-core";
import { AnonymousLayout } from "../layouts/anonymousLayout";
import { PublicLayout } from "../layouts/publicLayout";
import { authDataSelector } from "../stores/selectors";

export type MenuItem = RouteObject & {
  children?: MenuItem[];
  name?: string;
  icon?: IconName;
  skipForMenu?: boolean;
}

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
    path: "/stations/details/:stationId",
    name: "Station Details",
    Component: StationDetailsPage,
    skipForMenu: true,
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
    path: "/ext-data",
    name: "External Logs",
    icon: "file-lines",
    Component: ExtDataPage,
  },
  {
    path: "/users",
    name: "Users",
    icon: "user-md",
    Component: UsersPage,
  },
  {
    path: '/buildings',
    name: "Buildings",
    icon: "building",
    Component: BuildingsPage,
  },
  {
    path: "*",
    name: "Not found",
    Component: NotFoundPage,
    skipForMenu: true,
  },
];

const Routes: FC = () => {
  const authData = useAppSelector(authDataSelector);
  
  const changePasswordRoute = {
    path: "/changePassword",
    element: (<AnonymousLayout caption="Change password">
      <ChangePasswordPage />
    </AnonymousLayout>),
  } as RouteObject;

  const loginRoute = {
    path: "/login",
    element: (<AnonymousLayout caption="Log in to your account">
      <LoginPage/>
    </AnonymousLayout>),
  } as RouteObject;

  const routesForAuthenticatedOnly: MenuItem[] = [
    loginRoute,
    changePasswordRoute,
    {
      path: "/",
      element: (<ProtectedRoute/>),
      children: RootRoutes,
    },
  ];

  const routesForNotAuthenticated: RouteObject[] = [
    loginRoute,
    changePasswordRoute,
    {
      path: "/",
      element: <PublicLayout>
          <BuildingsPage />
        </PublicLayout>,
    },
    {
      path: '*',
      element: <Navigate to={"/"} />
    },
  ];

  const router = createBrowserRouter([
    ...(!authData?.accessToken ? routesForNotAuthenticated : []),
    ...routesForAuthenticatedOnly,
  ]);

  return <RouterProvider router={router} />;
};

export default Routes;
