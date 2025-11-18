import { Anchor, Box } from "@mantine/core";
import { FC } from "react";

export const Authors: FC = () => {
  return <Box fz='xs'>
      Co-authored by <Anchor size="xs" target="_blank" href="https://t.me/bearpawmaxim">@bearpawmaxim</Anchor> and <Anchor size="xs" target="_blank" href="https://t.me/gizmoboss">@gizmoboss</Anchor>
    </Box>;
};