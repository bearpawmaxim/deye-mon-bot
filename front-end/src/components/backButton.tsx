import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ActionIcon, Text, Tooltip } from "@mantine/core";
import { FC } from "react";
import { useNavigate } from "react-router-dom";

export const BackButton: FC = () => {
  const navigate = useNavigate();
  const hasHistory = window.history.state && window.history.length > 1;

  return (
    <Tooltip
      position="top"
      disabled={!hasHistory}
      label={
        <Text fw={500} fz={13}>
          Back
        </Text>
      }
    >
      <ActionIcon onClick={() => { navigate(-1); }} disabled={!hasHistory} mr="xs">
        <FontAwesomeIcon icon='left-long' />
      </ActionIcon>
    </Tooltip>
  );
};
