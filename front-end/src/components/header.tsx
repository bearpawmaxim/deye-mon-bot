import { FC } from "react";
import { Button, Icon, Menu, MenuItemProps } from "semantic-ui-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../stores/store";
import { logout } from "../stores/thunks/auth";

export type HeaderProps = {
  sidebarShown: boolean;
  setSidebarShown: (shown: boolean) => void;
}

export const Header: FC<HeaderProps> = ({ sidebarShown, setSidebarShown }: HeaderProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch()

  const logoutClick = () => {
    dispatch(logout());
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
      <Menu.Item as={Button} position="right" onClick={logoutClick}>
        <Icon name='sign-out' />Logout
      </Menu.Item>
    </Menu>
  )
}