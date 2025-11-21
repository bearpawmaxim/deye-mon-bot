import { FC, forwardRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button, Divider, Flex, Grid, Group, Image, rem, Stack , Switch, Text, Tooltip, useMantineColorScheme } from "@mantine/core";
import classes from "./styles/navbar.module.css"
import { MenuItem, RootRoutes } from "../../routes";
import { ThemePicker, UserAvatar } from "../../components";
import { UserData } from "../../stores/types";
import iconDark from "../../assets/icon_dark.png";
import iconLight from "../../assets/icon_light.png";

type MenuRowProps = {
  route: MenuItem;
  isNavbarCollapsed: boolean;
  closeMenu?: () => void;
};

const MenuRow: FC<MenuRowProps> = ({ route, isNavbarCollapsed, closeMenu }) => {
  const location = useLocation();
  const isActive = location.pathname === route.path;

  const LinkElement = forwardRef<HTMLAnchorElement>((_props, ref) => <Link
      ref={ref}
      data-collapse={isNavbarCollapsed}
      data-active={isActive}
      className={classes.navlink}
      to={route.path!}
      onClick={() => closeMenu?.call(this) }
    >
      <FontAwesomeIcon icon={route.icon!} />
      {!isNavbarCollapsed && <Text className={classes.nav_title}>{route.name}</Text>}
    </Link>);
  
  return isNavbarCollapsed ? (
    <Tooltip
      position="right"
      label={
        <Text fw={500} fz={13}>
          {route.name}
        </Text>
      }
    >
      <LinkElement />
    </Tooltip>
  ) : (
    <LinkElement />
  );
}

const NavbarSwitch: FC<{ isNavbarCollapsed: boolean, toggleNavbar: () => void}> =
  ({ isNavbarCollapsed, toggleNavbar}) => {
    return <Switch
        m="auto"
        checked={!isNavbarCollapsed}
        onChange={toggleNavbar}
        visibleFrom="md"
        style={{ flexShrink: 0 }}
        h={22}
        radius={4}
        defaultChecked
        styles={{
          root: { height: "100%" },
          body: { height: "100%" },
          track: {
            cursor: "pointer",
            height: "100%",
            minWidth: rem(26),
            width: rem(20),
          },
          thumb: {
            "--switch-track-label-padding": "-1px",
            height: "90%",
            width: rem(12),
            borderRadius: rem(3),
            insetInlineStart: "var(--switch-thumb-start, 1px)",
          },
        }}
      />;
  };

type NavbarProps = {
  user?: UserData;
  isNavbarCollapsed: boolean;
  toggleNavbar: () => void;
  closeMenu?: () => void;
  onProfileClick: () => void;
  onLogoutClick: () => void;
};

export const Navbar: FC<NavbarProps> = ({ user, isNavbarCollapsed, toggleNavbar, closeMenu, onProfileClick, onLogoutClick }) => {
  const { colorScheme } = useMantineColorScheme();
  const iconSrc = colorScheme === 'dark' ? iconLight : iconDark;
  
  return (
      <Stack
        w="100%"
        justify="space-between"
        align="stretch"
        h={{
          base: "calc(100% - var(--app-header-height))",
          md: "100%",
        }}
      >
        <Flex w="100%" gap={18} direction="column" align="start">
          <Group justify="space-between" align="center" w="100%" gap={isNavbarCollapsed? 0 : 'xs'}>
            <Grid align="center" justify="space-evenly">
               <Grid.Col span='content'>
                <Image h={40} w={40} src={iconSrc} alt="Logo" />
              </Grid.Col> 
              {!isNavbarCollapsed && (
                <Grid.Col span='auto'>
                  <Text className={classes.appTitle}>
                  Svitlo Power monitoring tool 
                  </Text>
                </Grid.Col>
              )}
              {!isNavbarCollapsed && (
                <Grid.Col span='content'>
                  <NavbarSwitch isNavbarCollapsed={isNavbarCollapsed} toggleNavbar={toggleNavbar} />
                </Grid.Col>
              )}
            </Grid>
          </Group>

          {isNavbarCollapsed && (
            <NavbarSwitch isNavbarCollapsed={isNavbarCollapsed} toggleNavbar={toggleNavbar} />
          )}

          <Flex
            w="100%"
            direction="column"
            align={isNavbarCollapsed ? "center" : "start"}
            gap={14}
          >
            <Text className={classes.navTitle} fz={12} fw={500} tt="uppercase">
              {isNavbarCollapsed ? "NAV" : "Navigation"}
            </Text>
            <Group gap={0}>
              { RootRoutes.map((route: MenuItem, i) => {
                if (route.skipForMenu) {
                  return;
                }
                return <MenuRow
                  key={`menu_${i}`}
                  route={route}
                  isNavbarCollapsed={isNavbarCollapsed}
                  closeMenu={closeMenu}
                  />
              })}
            </Group>
          </Flex>
        </Flex>

        <Stack justify="flex-end">
          <Divider hiddenFrom="sm" />
          <Group justify="space-evenly" hiddenFrom="sm">
            <UserAvatar userName={user?.name ?? ''} />
            <Flex direction="column" align="start">
              <Text
                className={classes.profileName}
                fz={13}
                lh={1}
                fw={500}
                lts={-0.3}
              >
                {user?.name}
              </Text>
            </Flex>
            <Divider orientation="vertical" />
            <Button
              variant="outline"
              disabled
              onClick={onProfileClick}
            >
              <FontAwesomeIcon icon="user-md" />
              Profile
            </Button>
            <Divider orientation="vertical" />
            <Button
              variant="outline"
              onClick={onLogoutClick}
            >
              <FontAwesomeIcon icon="sign-out" />
              Log out
            </Button>
          </Group>
          <Divider hiddenFrom="sm"/>
          <ThemePicker isNavbarCollapsed={isNavbarCollapsed} />
        </Stack>

      </Stack>
  );
}