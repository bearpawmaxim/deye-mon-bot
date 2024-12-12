import { FC } from "react"
import { Table, TableBody, TableHeader, TableHeaderCell, TableRow } from "semantic-ui-react"

export const StationsPage: FC = () => {
  return <Table striped celled inverted selectable compact>
    <TableHeader>
      <TableRow>
        <TableHeaderCell>Station</TableHeaderCell>
        <TableHeaderCell>Active</TableHeaderCell>
      </TableRow>
    </TableHeader>
    <TableBody>
    </TableBody>
  </Table>
}