import { FC } from "react";
import { ChatRequestListItem } from "../../../stores/types";
import { Button, TableCell, TableRow } from "semantic-ui-react";

type ChatRequestItemRowProps = {
  request: ChatRequestListItem;
  approve: () => void;
}
  
export const ChatRequestItemRow: FC<ChatRequestItemRowProps> = ({ request, approve }) => {
  return <TableRow>
    <TableCell>{request.chatName}</TableCell>
    <TableCell>{request.botName}</TableCell>
    <TableCell>{request.requestDate.toString()}</TableCell>
    <TableCell>
      <Button content='Approve' color="teal" onClick={approve} />
    </TableCell>
  </TableRow>;
};