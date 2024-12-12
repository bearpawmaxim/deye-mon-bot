import { FC } from "react"
import { Header, Table, TableBody, TableHeader, TableHeaderCell, TableRow } from "semantic-ui-react"

export const ChatsPage: FC = () => {
  return <>
    <Header as='h4' content='Allowed chats' />
    <Table striped celled inverted selectable compact>
    <TableHeader>
      <TableRow>
        <TableHeaderCell>Chat</TableHeaderCell>
      </TableRow>
    </TableHeader>
    <TableBody>
    </TableBody>
  </Table>
  <Header as='h4' content='Chat requests' />
  <Table striped celled inverted selectable compact>
    <TableHeader>
      <TableRow>
        <TableHeaderCell>Chat</TableHeaderCell>
        <TableHeaderCell />
      </TableRow>
    </TableHeader>
    <TableBody>
    </TableBody>
  </Table>
  </>
}