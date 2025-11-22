import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Anchor, Box, em } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { FC } from "react";

export const Authors: FC = () => {
  const isMobile = useMediaQuery(`(max-width: ${em(750)})`);
  return <Box fz='xs' style={{ lineHeight: isMobile ? 0 : 'var(--app-shell-footer-height)' }}>
      Co-authored by&nbsp;
      <Anchor size="xs" target="_blank" href="https://t.me/bearpawmaxim">
        { !isMobile && <FontAwesomeIcon icon='user-md' /> }
        @bearpawmaxim
      </Anchor>
      &nbsp;and&nbsp;
      <Anchor size="xs" target="_blank" href="https://t.me/gizmoboss">
        { !isMobile && <FontAwesomeIcon icon='user-md' /> }
        @gizmoboss
      </Anchor>
    </Box>;
};