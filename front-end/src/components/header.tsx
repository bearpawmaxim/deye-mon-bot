import { FC } from "react";
import apiClient from "../utils/apiClient";
import { useAuth } from "../providers/authProvider";
import { Button, Icon, Menu, MenuItemProps } from "semantic-ui-react";
import { useNavigate } from "react-router-dom";

export type HeaderProps = {
  sidebarShown: boolean;
  setSidebarShown: (shown: boolean) => void;
}

export const Header: FC<HeaderProps> = ({ sidebarShown, setSidebarShown }: HeaderProps) => {
  const { setToken } = useAuth();
  const navigate = useNavigate();

  const logout = () => {
    apiClient.post("auth/logout").then(() => setToken(null));
  };

  const onLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, _: MenuItemProps) => {
    e.preventDefault();
    navigate('/');
  };

  const iconName = sidebarShown ? 'caret square left outline' : 'caret square right outline';
  return (
    <Menu inverted attached="top" className="header-row" size="massive" >
      <Menu.Item className="sidebar header-item" as="a" onClick={() => setSidebarShown(!sidebarShown)}>
        <Icon name={iconName} />
      </Menu.Item>
      <Menu.Item as="a" to="/" onClick={onLinkClick} className="header-item">
        Deye monitoring bot control panel
      </Menu.Item>
      <Menu.Item as={Button} position="right" onClick={logout}>
        <Icon name='sign-out' />Logout
      </Menu.Item>
    </Menu>
  )
}