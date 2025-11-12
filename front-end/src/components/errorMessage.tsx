import { FC } from "react";
import { Text, TextProps } from "@mantine/core";

type ErrorMessageProps = TextProps & {
  content?: string | null;
}

export const ErrorMessage: FC<ErrorMessageProps> = ({ content, ...props }) => {
  return content ? <Text size="xs" c="red.8" pt="sm" {...props}>
    {content}
  </Text> : null;
};