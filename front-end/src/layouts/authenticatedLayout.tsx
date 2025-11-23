import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { FC, Suspense, useCallback, useEffect } from "react";
import { RootRoutes } from "../routes";
import { useHeaderContent } from "../providers";
import { RootState, useAppDispatch } from "../stores/store";
import { connect } from "react-redux";
import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classes from './styles/authenticatedLayout.module.css';
import { Header } from "./components/header";
import { Navbar } from "./components/navbar";
import useLocalStorage from "../hooks/useLocalStorage";
import { ProfileData } from "../stores/types";
import { fetchProfile, logout } from "../stores/thunks";
import { openProfileEditDialog } from "../dialogs";

type ComponentProps = {
  token: string | null;
  profile: ProfileData;
};

const mapStateToProps = (state: RootState): ComponentProps => ({
  token: state.auth.token,
  profile: state.auth.profile!,
});

const Component: FC<ComponentProps> = ({ token, profile }) => {
  const dispatch = useAppDispatch()
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (token && !profile) {
      dispatch(fetchProfile());
    }
  }, [token, profile, dispatch]);

  const [opened, { toggle, close }] = useDisclosure();

  const { headerButtons, headerText } = useHeaderContent();

  
  const caption = headerText ? headerText : RootRoutes.find(f => f.path === location.pathname)?.name;

  const [ isNavbarCollapsed, setNavbarCollapsed ] = useLocalStorage('dmb-nv-collapsed', false);
  const toggleNavbar = useCallback(() => {
    setNavbarCollapsed(!isNavbarCollapsed);
  }, [isNavbarCollapsed, setNavbarCollapsed]);

  useEffect(() => {
    const navbar = document.querySelector('.mantine-AppShell-navbar');
    if (navbar) {
      console.log(
        'Navbar width var:',
        getComputedStyle(navbar).getPropertyValue('--app-shell-navbar-width')
      );
      console.log(
        'Navbar computed width:',
        getComputedStyle(navbar).width
      );
    }
  }, [isNavbarCollapsed, opened]);

  const onLogoutClick = () => {
    dispatch(logout());
  };

  const onProfileEditClick = () => {
    openProfileEditDialog({ navigate });
  };

  return (
    <AppShell
      classNames={{
        root: classes.root,
        navbar: classes.navbar,
        header: classes.header,
        main: classes.main,
      }}
      navbar={{
        width: isNavbarCollapsed ? 60 : 260,
        breakpoint: "md",
        collapsed: { mobile: !opened },
      }}
      layout="alt"
      transitionTimingFunction="step-start"
    >
      <AppShell.Header ms={0}>
        <Header
          user={profile}
          opened={opened}
          toggle={toggle}
          caption={caption!}
          buttons={headerButtons}
          onProfileClick={onProfileEditClick}
          onLogoutClick={onLogoutClick}
        />
      </AppShell.Header>
      <AppShell.Navbar data-collpased={isNavbarCollapsed}>
        <Navbar
          user={profile}
          isNavbarCollapsed={isNavbarCollapsed}
          toggleNavbar={toggleNavbar}
          closeMenu={close}
          onProfileClick={onProfileEditClick}
          onLogoutClick={onLogoutClick}
        />
      </AppShell.Navbar>
      <AppShell.Main>
        <Suspense>
          { token && profile && <Outlet /> }
        </Suspense>
      </AppShell.Main>
    </AppShell>
  );
};

export const AuthenticatedLayout = connect(mapStateToProps)(Component);