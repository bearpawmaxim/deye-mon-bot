import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Segment, Sidebar } from "semantic-ui-react";
import { FC, useEffect, useState } from "react";
import { RootRoutes } from "../routes";
import { Header, PageHeader, SideMenu } from "../components";
import { useHeaderContent } from "../providers";
import { setupResponseInterceptor } from "../utils";
import { store } from "../stores/store";


const AuthenticatedLayout: FC = () => {
  const [sidebarShown, setSidebarShown] = useState(true);
  const {headerButtons, headerText} = useHeaderContent();
  const navigate = useNavigate();

  useEffect(() => {
    setupResponseInterceptor(store, navigate);
  }, [navigate]);

  const location = useLocation();
  const caption = Boolean(headerText) ? headerText : RootRoutes.find(f => f.path === location.pathname)?.name;

  return <>
    <Header sidebarShown={sidebarShown} setSidebarShown={setSidebarShown} />
    <Sidebar.Pushable attached="bottom">
      <SideMenu sidebarShown={sidebarShown} />
      <Sidebar.Pusher as={Segment} basic className={"content-container" + (sidebarShown ? " with-sidebar" : "")}>
        <PageHeader caption={caption} buttons={headerButtons}/>
        <Outlet />
      </Sidebar.Pusher>
    </Sidebar.Pushable>
  </>;
}
export default AuthenticatedLayout;
