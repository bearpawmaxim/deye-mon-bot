import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { RootState, useAppDispatch } from "../../stores/store";
import { logout } from "../../stores/thunks/auth";
import { UserData } from "../../stores/types";
import { connect } from "react-redux";
import { Burger, Button, Menu, Text, Box, Flex, Divider, Group, Transition  } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classes from "./styles/header.module.css"
import { BackButton, UserAvatar } from "../../components";
import { PageHeaderButton } from "../../providers";

type ComponentOwnProps = {
  opened: boolean;
  toggle: () => void;
  caption: string;
  buttons: Array<PageHeaderButton>;
};

type ComponentProps = ComponentOwnProps & {
  user: UserData;
};

const mapStateToProps = (state: RootState, ownProps: ComponentOwnProps): ComponentProps => ({
  user: state.auth.user!,
  opened: ownProps.opened,
  toggle: ownProps.toggle,
  caption: ownProps.caption,
  buttons: ownProps.buttons,
});

const Component: FC<ComponentProps> = ({ user, opened, toggle, caption, buttons }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch()

  const onLogoutClick = () => {
    dispatch(logout());
  };

  const onProfileEditClick = () => {
    navigate('/profile');
  };

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
                {buttons.map((button, i) => (
                    <Button
                      key={`btn_${i}`}
                      color={button.color}
                      disabled={button.disabled}
                      onClick={() => button.onClick()}
                      leftSection={button.icon ? <FontAwesomeIcon icon={button.icon!} /> : null}
                      size="xs"
                    >
                      {button.text}
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
                  <UserAvatar userName={user?.name} />
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
                </Flex>
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<FontAwesomeIcon icon='user-md' />} onClick={onProfileEditClick}>
                Profile
              </Menu.Item>
              <Menu.Item leftSection={<FontAwesomeIcon icon='sign-out' />} onClick={onLogoutClick}>
                Log out
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Flex>
      </Box>
    </Box>
  );
};

export const Header = connect(mapStateToProps)(Component);