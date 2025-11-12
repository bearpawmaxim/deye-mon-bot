import { Outlet, useLocation } from "react-router-dom";
import { FC, Suspense, useCallback, useEffect } from "react";
import { RootRoutes } from "../routes";
import { useHeaderContent } from "../providers";
import { RootState } from "../stores/store";
import { createSelector } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classes from './styles/authenticatedLayout.module.css';
import { Header } from "./components/header";
import { Navbar } from "./components/navbar";
import useLocalStorage from "../hooks/useLocalStorage";

const selectProfileAndToken = createSelector(
  (state: RootState) => state.auth.token,
  (token) => ({ token })
);

export const AuthenticatedLayout: FC = () => {
  const [opened, { toggle, close }] = useDisclosure();

  const { headerButtons, headerText } = useHeaderContent();

  const location = useLocation();
  const caption = headerText ? headerText : RootRoutes.find(f => f.path === location.pathname)?.name;

  const { token } = useSelector(selectProfileAndToken);

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
        <Header opened={opened} toggle={toggle} caption={caption!} buttons={headerButtons}/>
      </AppShell.Header>
      <AppShell.Navbar data-collpased={isNavbarCollapsed}>
        <Navbar isNavbarCollapsed={isNavbarCollapsed} toggleNavbar={toggleNavbar} closeMenu={close}/>
      </AppShell.Navbar>
      <AppShell.Main>
        <Suspense>
          { token && <Outlet /> }
        </Suspense>
      </AppShell.Main>
    </AppShell>
  );
};
