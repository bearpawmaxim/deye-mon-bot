import { FC, ReactNode } from "react";
import { Box, Container, Flex, Title } from "@mantine/core";
import { ThemePicker } from "../components";

type PublicLayoutProps = {
  children: ReactNode;
}

export const PublicLayout: FC<PublicLayoutProps> = ({ children }) => {
  return <>
    <Box
      style={{
        borderBottom: "1px solid var(--mantine-color-default-border)",
        backgroundColor: "var(--mantine-color-body)",
      }}
      py="lg"
    >
      <Container size="xl" px="xl">
        <Flex justify="space-between" align="center">
          <Title order={2}>Power Monitoring</Title>
          <ThemePicker isNavbarCollapsed={false} size="md" />
        </Flex>
      </Container>
    </Box>
    {children}
  </>;
};
