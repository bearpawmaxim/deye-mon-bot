import { TableCell, TableRow } from "semantic-ui-react";
import { AllowedChatListItem } from "../../../stores/types";
import { FC } from "react";


type AllowedChatItemRowProps = {
  chat: AllowedChatListItem;
}

export const AllowedChatItemRow: FC<AllowedChatItemRowProps> = ({ chat }) => {
  return <TableRow>
    <TableCell>{chat.chatName}</TableCell>
    <TableCell>{chat.botName}</TableCell>
    <TableCell>{chat.approveDate.toString()}</TableCell>
  </TableRow>;
};