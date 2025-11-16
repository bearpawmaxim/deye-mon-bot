import { FC, ReactNode } from "react";
import { AppShell, Box, Container, Group, Title } from "@mantine/core";
import { ThemePicker } from "../components";
import classes from './styles/publicLayout.module.css';
import { VisitTracker } from "./components/visitTracker";
import { Authors } from "./components/authors";

type PublicLayoutProps = {
  children: ReactNode;
};

export const PublicLayout: FC<PublicLayoutProps> = ({ children }) => {
  return <AppShell
      header={{ height: 60 }}
      layout="default"
      footer={{ height: 42 }}
    >
      <AppShell.Header>
        <header className={classes.header}>
          <Container size="md" className={classes.inner}>
            <Title order={2}>Power monitoring</Title>
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
        <Container size="md">
        <Group justify="space-between">
          <Authors />
          <VisitTracker />
        </Group>
        </Container>
      </AppShell.Footer>
    </AppShell>;
};
