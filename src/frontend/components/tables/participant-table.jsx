import { Badge } from "@/frontend/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/frontend/components/ui/table";

export default function ParticipantTable({ rows = [] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>NDIS Number</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((participant) => (
          <TableRow key={participant.id}>
            <TableCell className="font-medium">{participant.fullName}</TableCell>
            <TableCell>{participant.ndisNumber}</TableCell>
            <TableCell>{participant.phone}</TableCell>
            <TableCell>
              <Badge variant={participant.status === "active" ? "success" : "outline"}>
                {participant.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
