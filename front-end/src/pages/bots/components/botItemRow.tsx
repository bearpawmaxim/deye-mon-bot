import { FC, useState } from "react";
import { BotItem } from "../../../stores/types";
import { Checkbox, CheckboxProps, Icon, Label, TableCell, TableRow } from "semantic-ui-react";
import { TokenEditDialog } from "./tokenEditDialog";


type BotItemRowProps = {
  item: BotItem;
  enableChanged: (enabled: boolean) => void;
  tokenChanged: (result: boolean, token: string) => void;
}

export const BotItemRow: FC<BotItemRowProps> = ({ item, enableChanged, tokenChanged }: BotItemRowProps) => {
  const [open, setOpen] = useState(false);
  const enableChange = (_: unknown, data: CheckboxProps) => {
    enableChanged(data.checked!);
  };
  return (<TableRow>
    <TableCell>
      <Icon name="pencil" color={item.changed ? 'orange' : 'grey'}></Icon>
      {item.name}
    </TableCell>
    <TableCell width={"1"} textAlign="center">
      <TokenEditDialog changed={tokenChanged} create={false} opened={open} setOpened={setOpen} token={item.token} />
      <Label color='teal' onClick={() => setOpen(true)} style={{ cursor: 'pointer' }}>Edit</Label>
    </TableCell>
    <TableCell width={"1"} textAlign="center">
      <Checkbox checked={item.enabled} onChange={enableChange}></Checkbox>
    </TableCell>
  </TableRow>);
}
