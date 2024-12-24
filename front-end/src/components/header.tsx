import { FC, useEffect } from "react";
import { Button, Grid, GridColumn, GridRow, Icon, Menu, MenuItemProps } from "semantic-ui-react";
import { useNavigate } from "react-router-dom";
import { RootState, useAppDispatch } from "../stores/store";
import { fetchUser, logout } from "../stores/thunks/auth";
import { UserData } from "../stores/types";
import { connect } from "react-redux";


type HeaderOwnProps = {
  sidebarShown: boolean;
  setSidebarShown: (shown: boolean) => void;
}

type HeaderStateProps = {
  user: UserData;
};

type ComponentProps = HeaderOwnProps & HeaderStateProps;

const mapStateToProps = (state: RootState, ownProps: HeaderOwnProps): ComponentProps => ({
  user: state.auth.user!,
  sidebarShown: ownProps.sidebarShown,
  setSidebarShown: ownProps.setSidebarShown,
});

const Component: FC<ComponentProps> = ({ sidebarShown, setSidebarShown, user }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!user) {
      dispatch(fetchUser());
    };
  }, [user]);

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
        <Grid>
          <GridColumn textAlign="left">
            <GridRow>
              {user?.name && (<><Icon name='user' />{user.name}</>)}
            </GridRow>
            <GridRow>
              <Icon name='sign-out' />Logout
            </GridRow>
          </GridColumn>
        </Grid>
      </Menu.Item>
    </Menu>
  )
};

export const Header = connect(mapStateToProps)(Component);