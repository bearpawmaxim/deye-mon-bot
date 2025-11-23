import { FC, useEffect, useMemo, useState } from "react";
import { ProfileData } from "../../stores/types";
import { Burger, Button, Menu, Text, Box, Flex, Divider, Group, Transition, ActionIcon, Indicator  } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classes from "./styles/header.module.css"
import { BackButton, UserAvatar } from "../../components";
import { PageHeaderButton } from "../../providers";
import { useLocation } from "react-router-dom";

type HeaderProps = {
  opened: boolean;
  toggle: () => void;
  caption: string;
  buttons: Array<PageHeaderButton>;
  user?: ProfileData;
  onProfileClick: () => void;
  onLogoutClick: () => void;
};

export const Header: FC<HeaderProps> = ({ user, opened, toggle, caption, buttons, onProfileClick, onLogoutClick }) => {
  const [initialDisabled, setInitialDisabled] = useState<boolean[] | null>(null);

  useEffect(() => {
    if (buttons.length > 0 && initialDisabled === null) {
      setTimeout(() => setInitialDisabled(buttons.map(b => b.disabled)), 1);
    }
  }, [buttons, initialDisabled]);

  const { buttonsChanged, anyChanged } = useMemo(() => {
    if (!initialDisabled) {
      return {
        buttonsChanged: buttons.map(() => false),
        anyChanged: false
      };
    }

    const changed = buttons.map(
      (b, i) => b.disabled !== initialDisabled[i]
    );

    return {
      buttonsChanged: changed,
      anyChanged: changed.some(Boolean)
    };
  }, [buttons, initialDisabled]);

  const location = useLocation();

  useEffect(() => {
    setTimeout(() => setInitialDisabled(null), 1);
  }, [location.pathname]);

  return (
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
                  {caption}
                </Text>
              </Group>
            )}
          </Transition>
        </Flex>
        <Flex h="100%" align="center" gap={12}>
          <Transition mounted={!opened} transition="slide-down" duration={200} timingFunction="ease">
            {(styles) => (
              <Group gap="sm" style={styles}>
                <Box visibleFrom="md">
                  {buttons.map((button, i) => (
                    <Indicator
                      key={`btn_${i}`}
                      disabled={!buttonsChanged[i]}
                      display={'inline-flex'}
                      withBorder
                      processing
                      color="teal"
                      size={15}
                      position="top-end"
                    >
                      <Button  
                        color={button.color}
                        disabled={button.disabled}
                        onClick={() => button.onClick()}
                        leftSection={button.icon ? <FontAwesomeIcon icon={button.icon!} /> : null}
                        size="xs"
                        ml='xs'
                      >
                        {button.text}
                      </Button>
                    </Indicator>
                  ))}
                </Box>
                <Box hidden={buttons.length === 0} hiddenFrom="md">
                  <Menu trigger="click" transitionProps={{ transition: 'fade-up', duration: 150 }}>
                    <Menu.Target>
                      <Indicator
                        disabled={!anyChanged}
                        withBorder
                        processing
                        color="teal"
                        size={15}
                        position="top-start"
                      >
                        <ActionIcon disabled={buttons.length === 0}>
                          <FontAwesomeIcon icon='chevron-down' />
                        </ActionIcon>
                      </Indicator>
                    </Menu.Target>
                    <Menu.Dropdown>
                      {buttons.map((button, i) => (
                        <Indicator
                          key={`btn_${i}`}
                          disabled={!buttonsChanged[i]}
                          withBorder
                          processing
                          color="teal"
                          size={15}
                          position="middle-start"
                        >
                          <Menu.Item
                            color={button.color}
                            disabled={button.disabled}
                            onClick={() => button.onClick()}
                            leftSection={button.icon ? <FontAwesomeIcon icon={button.icon!} /> : null}
                          >
                            {button.text}
                          </Menu.Item>
                        </Indicator>
                      ))}
                    </Menu.Dropdown>
                  </Menu>
                </Box>
                <Divider orientation="vertical" size="md" visibleFrom='md' />
              </Group>
            )}
          </Transition>
          <Box visibleFrom='md'>
            <Menu shadow="md" width={200} trigger="click" transitionProps={{ transition: 'fade-up', duration: 150 }} >
              <Menu.Target>
                <Button px={6} variant="subtle" h={34}>
                  <Flex align="center" gap={10}>
                    <UserAvatar userName={user?.userName ?? ''} />
                    <Flex direction="column" align="start">
                      <Text
                        className={classes.profileName}
                        fz={13}
                        lh={1}
                        fw={500}
                        lts={-0.3}
                      >
                        {user?.userName}
                      </Text>
                    </Flex>
                  </Flex>
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<FontAwesomeIcon icon='user-md' />}
                  onClick={onProfileClick}
                >
                  Profile
                </Menu.Item>
                <Menu.Item
                  leftSection={<FontAwesomeIcon icon='sign-out' />}
                  onClick={onLogoutClick}
                >
                  Log out
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
};
