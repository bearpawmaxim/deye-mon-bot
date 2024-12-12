import { Outlet, useLocation } from "react-router-dom";
import { Header } from "../components/header";
import { SideMenu } from "../components/sideMenu";
import { Header as SemanticHeader, Segment, Sidebar } from "semantic-ui-react";
import { FC, useState } from "react";
import { RootRoutes } from "../routes";

const AuthenticatedLayout: FC = () => {
  const [sidebarShown, setSidebarShown] = useState(true);
  const location = useLocation();
  const caption = RootRoutes.find(f => f.path === location.pathname)?.name;

  return <>
    <Header sidebarShown={sidebarShown} setSidebarShown={setSidebarShown} />
    <Sidebar.Pushable attached="bottom">
      <SideMenu sidebarShown={sidebarShown} />
      <Sidebar.Pusher as={Segment} basic className={"content-container" + (sidebarShown ? " with-sidebar" : "")}>
        <SemanticHeader as='h2' color="teal" content={caption} textAlign='left' />
        <Outlet />
      </Sidebar.Pusher>
    </Sidebar.Pushable>
  </>;
}
export default AuthenticatedLayout;
