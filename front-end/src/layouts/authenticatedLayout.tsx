import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDisclosure, useLocalStorage } from "@mantine/hooks";
import { AppShell, Box, Burger, Button, Divider, Flex, Group, Menu, Transition } from "@mantine/core";
import classes from './styles/AuthenticatedLayout.module.css';
import { FC, Suspense, useCallback, useEffect, useState } from "react";
import { RootRoutes } from "../routes";
import { Header, PageHeader, SideMenu } from "../components";
import { useHeaderContent } from "../providers";
import { setupResponseInterceptor } from "../utils";
import { store } from "../stores/store";


const AuthenticatedLayout: FC = () => {
  const [opened, { toggle, close }] = useDisclosure();

  const [sidebarShown, setSidebarShown] = useState(true);
  const {headerButtons, headerText} = useHeaderContent();
  const navigate = useNavigate();

  useEffect(() => {
    setupResponseInterceptor(store, navigate);
  }, [navigate]);

  const location = useLocation();
  const caption = headerText ?? RootRoutes.find(f => f.path === location.pathname)?.name;

  const [ isNavbarCollapsed, setNavbarCollapsed ] = useLocalStorage({ key: 'deye-mon-navbar-collapsed', defaultValue: false });
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

  return <>
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
      <AppShell.Header>
        <Box className={classes.root} w="100%" h="100%">
      <Box className={classes.wrapper} w="100%" h="100%">
        <Flex align="center" gap={4}>
          <Burger
            mr={10}
            opened={opened}
            onClick={toggle}
            hiddenFrom="md"
            size="sm"
          />
          <Transition mounted={!opened} transition="slide-down" duration={200} timingFunction="ease">
            {(styles) => (
              <Group
                style={{ ...styles, flexWrap: 'nowrap', wordBreak: 'break-word', whiteSpace: 'normal' }}
                gap={0}
              >
                <BackButton />
                <Text lts={-0.4} fw={500}>
                  {t(caption)}
                </Text>
              </Group>
            )}
          </Transition>
        </Flex>
        <Flex h="100%" align="center" gap={12}>
          <Transition mounted={!opened} transition="slide-down" duration={200} timingFunction="ease">
            {(styles) => (
              <Group gap="sm" style={styles}>
                {buttons.map((button, i) => (
                    <Button
                      color={button.color}
                      disabled={button.disabled}
                      onClick={() => button.onClick()}
                      leftSection={button.icon ? <FontAwesomeIcon icon={button.icon!} /> : null}
                      size="xs"
                    >
                      {t(button.text)}
                    </Button>
                ))}
                <Divider orientation="vertical" size="md" />
              </Group>
            )}
          </Transition>
          <Menu shadow="md" width={200} trigger="click" transitionProps={{ transition: 'fade-up', duration: 150 }}>
            <Menu.Target>
              <Button px={6} variant="subtle" h={34}>
                <Flex align="center" gap={10}>
                  <UserAvatar userName={user.UserName} />
                  <Flex direction="column" align="start">
                    <Text
                      className={classes.profileName}
                      fz={13}
                      lh={1}
                      fw={500}
                      lts={-0.3}
                    >
                      {user.UserName}
                    </Text>
                  </Flex>
                </Flex>
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<FontAwesomeIcon icon='user-md' />} onClick={onProfileEditClick}>
                {t('route.profile')}
              </Menu.Item>
              <Menu.Item leftSection={<FontAwesomeIcon icon='sign-out' />} onClick={onLogoutClick}>
                {t('route.logout')}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Flex>
      </Box>
    </Box>
      </AppShell.Header>
      <AppShell.Navbar data-collpased={isNavbarCollapsed}>
        <Navbar isNavbarCollapsed={isNavbarCollapsed} toggleNavbar={toggleNavbar} closeMenu={close}/>
      </AppShell.Navbar>
      <AppShell.Main>
        <Suspense>
          <Outlet />
        </Suspense>
      </AppShell.Main>
    </AppShell>
  </>;
}
export default AuthenticatedLayout;
