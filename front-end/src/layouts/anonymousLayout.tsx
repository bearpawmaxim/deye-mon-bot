import { FC, ReactElement, ReactNode } from "react";
import { Box, Center, Container, Divider, Group, Stack, Text, Title } from "@mantine/core";
import classes from './styles/anonymousLayout.module.css';
import { Page, ThemePicker } from "../components";

export type AnonymousLayoutProps = {
  caption: string;
  children: ReactNode | ReactElement;
};

export const AnonymousLayout: FC<AnonymousLayoutProps> = ({ caption, children }) => {
  return <Stack justify="center" h="100dvh">
    <Container w={{ base: 400, md: 450 }}>
      <Center>
        <Group wrap="nowrap">
          <Box ta={"center"}>
            <Title className={classes.title} order={2}>
              Deye monitoring bot control panel 
            </Title>
            <Divider />
            <Text className={classes.subtitle}>
              {caption}
            </Text>
          </Box>
        </Group>
      </Center>
    </Container>
    <Container w={{ base: 400, md: 450 }}>
      <Page withBorder shadow="sm" p={22} mt={10} radius="md">
        {children}
        <Divider mt="md"/>
        <Group mt="md" justify="space-between">
          <ThemePicker isNavbarCollapsed={false} size="xs"/>
        </Group>
      </Page>
    </Container>
  </Stack>;
};
