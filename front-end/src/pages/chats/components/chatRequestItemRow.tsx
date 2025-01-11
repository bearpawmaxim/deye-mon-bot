import { FC } from "react";
import { ChatRequestListItem } from "../../../stores/types";
import { Button, ButtonGroup, TableCell, TableRow } from "semantic-ui-react";

type ChatRequestItemRowProps = {
  request: ChatRequestListItem;
  approve: () => void;
  reject: () => void;
}
  
export const ChatRequestItemRow: FC<ChatRequestItemRowProps> = ({ request, approve, reject }) => {
  return <TableRow>
    <TableCell>{request.chatName}</TableCell>
    <TableCell>{request.botName}</TableCell>
    <TableCell>{request.requestDate.toString()}</TableCell>
    <TableCell textAlign="center">
      <ButtonGroup size="mini">
        <Button icon="check" content='Approve' color="teal" onClick={approve} />
        <Button icon="cancel" content='Reject' color="orange" onClick={reject} />
      </ButtonGroup>
    </TableCell>
  </TableRow>;
};