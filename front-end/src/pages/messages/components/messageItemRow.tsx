import { FC } from "react";
import { Label, TableCell, TableRow } from "semantic-ui-react";
import { ServerMessageListItem } from "../../../stores/types";


type MessageItemRowProps = {
  message: ServerMessageListItem;
  onEditClick: () => void;
}

export const MessageItemRow: FC<MessageItemRowProps> = ({ message, onEditClick }) => {
  return <TableRow>
    <TableCell>{message.name}</TableCell>
    <TableCell>{message.channelName}</TableCell>
    <TableCell>{Boolean(message.stationName) ? message.stationName : 'All stations'}</TableCell>
    <TableCell>{message.botName}</TableCell>
    <TableCell>{message.lastSentTime?.toString() ?? 'Never'}</TableCell>
    <TableCell textAlign='center'>
      <Label color={message.enabled ? 'green' : 'red'} content={message.enabled ? 'Yes' : 'No'} />
    </TableCell>
    <TableCell textAlign='center'>
      <Label color={'teal'} content='Edit'
        style={{ cursor: 'pointer' }} onClick={onEditClick}/>
    </TableCell>
  </TableRow>
};