import { Button, Label, TableCell, TableRow } from "semantic-ui-react";
import { AllowedChatListItem } from "../../../stores/types";
import { FC } from "react";


type AllowedChatItemRowProps = {
  chat: AllowedChatListItem;
  disallow: () => void;
}

export const AllowedChatItemRow: FC<AllowedChatItemRowProps> = ({ chat, disallow }) => {
  return <TableRow>
    <TableCell>{chat.chatName}</TableCell>
    <TableCell>{chat.botName}</TableCell>
    <TableCell>{chat.approveDate.toString()}</TableCell>
    <TableCell textAlign="center">
      <Button icon="cancel" content='Disallow' color="orange" size="mini" onClick={disallow} />
    </TableCell>
  </TableRow>;
};