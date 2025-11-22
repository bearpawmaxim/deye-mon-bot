import { FC, ReactNode, useEffect, useState } from "react";
import { Anchor, AppShell, Box, Container, Group, Image, SimpleGrid, Title, Transition, useMantineColorScheme } from "@mantine/core";
import { ThemePicker } from "../components";
import classes from './styles/publicLayout.module.css';
import { VisitTracker } from "./components/visitTracker";
import { Authors } from "./components/authors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import iconDark from "../assets/icon_dark.png";
import iconLight from "../assets/icon_light.png";

type PublicLayoutProps = {
  children: ReactNode;
};

export const PublicLayout: FC<PublicLayoutProps> = ({ children }) => {
  const [isAltPressed, setIsAltPressed] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const { colorScheme } = useMantineColorScheme();
  const iconSrc = colorScheme === 'dark' ? iconLight : iconDark;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.altKey) {
      setIsAltPressed(true);
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (!e.altKey) {
      setTimeout(() => setIsAltPressed(false), 4000);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return <AppShell
      header={{ height: 60 }}
      layout="default"
      footer={{ height: 42 }}
    >
      <AppShell.Header
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}>
        <header className={classes.header}>
          <Container size="md" className={classes.inner}>
            <Group justify="flex-start" align="center">
              <Image h={40} w={40} src={iconSrc} alt="Logo" />
              <Title  className={classes.title} order={2}>vitlo Power</Title>
              <Transition transition="slide-down" mounted={isHovering && isAltPressed}>
                {(transitionStyles) => (
                  <Anchor
                    style={transitionStyles}
                    href="/login"
                  >
                    <FontAwesomeIcon icon='sign-in'/>
                    Log in
                  </Anchor>
                )}
              </Transition>
            </Group>
            <ThemePicker isNavbarCollapsed={false} size="md" />
          </Container>
        </header>
      </AppShell.Header>
      <AppShell.Main>
        <Box className={classes.main}>
          {children}
        </Box>
      </AppShell.Main>
      <AppShell.Footer>
        <SimpleGrid pt={2} verticalSpacing={0} spacing={0} p={0} ta={'center'} cols={{ xs: 1, md: 2}}>
          <Authors />
          <VisitTracker/>
        </SimpleGrid>
      </AppShell.Footer>
    </AppShell>;
};
