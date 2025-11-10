import { Avatar } from "@mantine/core";
import { FC } from "react";

type UserAvatarProps = {
  userName: string;
  endpoint?: string;
};

export const UserAvatar: FC<UserAvatarProps> = ({ userName }) => {
  return <Avatar size={30} color="initials" name={userName} />
};