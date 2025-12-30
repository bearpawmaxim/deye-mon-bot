import { FC, ReactElement, ReactNode } from "react";
import { Box, Button, Center, Container, Divider, Group, Image, Menu, Stack, Text, useMantineColorScheme } from "@mantine/core";
import classes from './styles/anonymousLayout.module.css';
import { CountryFlag, LangPicker, Page, ThemePicker } from "../components";
import iconDark from "../assets/icon_dark_with_text.png";
import iconLight from "../assets/icon_light_with_text.png";
import { useTranslation } from "react-i18next";

export type AnonymousLayoutProps = {
  caption: string;
  children: ReactNode | ReactElement;
};

export const AnonymousLayout: FC<AnonymousLayoutProps> = ({ caption, children }) => {
  const { colorScheme } = useMantineColorScheme();
  const iconSrc = colorScheme === 'dark' ? iconLight : iconDark;
  const { t } = useTranslation();

  return <Stack justify="center" h="100dvh">
    <Container w={{ base: 400, md: 450 }}>
      <Center>
        <Group wrap="nowrap">
          <Box ta={"center"}>
            <Center mt="md">
              <Image h={60} w="auto" src={iconSrc} alt="Logo" />
            </Center>
            <Text className={classes.subtitle}>
              {t(caption)}
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
            <Menu shadow="md" trigger="click">
            <Menu.Target>
              <Button px={6} variant="subtle" leftSection={<CountryFlag />}>
                {t('title.language')}
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <LangPicker />
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Page>
    </Container>
  </Stack>;
};
