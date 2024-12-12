import { FC } from "react";
import { MenuItem, RootRoutes } from "../routes";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, MenuItemProps, Sidebar } from "semantic-ui-react";

export type SideMenuProps = {
  sidebarShown: boolean;
}

export const SideMenu: FC<SideMenuProps> = ({ sidebarShown }: SideMenuProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const onLinkClick = (path: string, e: React.MouseEvent<HTMLAnchorElement>, _: MenuItemProps) => {
    e.preventDefault();
    navigate(path);
  }

  return (
    <Sidebar as={Menu} width='thin' height='100%' vertical inline="true" inverted visible={sidebarShown}>
      {
        RootRoutes.map((route: MenuItem) => {
          return (<Menu.Item as='a' key={`link_${route.path}`}
            className={location.pathname === route.path ? "active" : ""}
            color='teal' href={route.path}
            onClick={onLinkClick.bind(this, route.path!)}
            >{route.name}</Menu.Item>)
        })
      }
    </Sidebar>
  );
}