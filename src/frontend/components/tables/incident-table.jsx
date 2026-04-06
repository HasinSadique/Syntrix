import { Badge } from "@/frontend/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/frontend/components/ui/table";

export default function IncidentTable({ rows = [] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Participant</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Severity</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((incident) => (
          <TableRow key={incident.id}>
            <TableCell>{incident.participantName || incident.participantId}</TableCell>
            <TableCell>{incident.incidentType}</TableCell>
            <TableCell>
              <Badge
                variant={
                  incident.severity === "high"
                    ? "warning"
                    : incident.severity === "medium"
                      ? "info"
                      : "outline"
                }
              >
                {incident.severity}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={incident.status === "open" ? "warning" : "success"}>
                {incident.status}
              </Badge>
            </TableCell>
            <TableCell>{incident.incidentDate}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
