"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/frontend/components/common/page-header";
import AssignmentForm from "@/frontend/components/forms/assignment-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/frontend/components/ui/table";
import { assignmentService } from "@/frontend/services/assignmentService";
import { participantService } from "@/frontend/services/participantService";
import { userService } from "@/frontend/services/userService";
import { extractApiError } from "@/frontend/services/http";
import { useCurrentUser } from "@/frontend/hooks/useCurrentUser";

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const { user } = useCurrentUser();

  const canAssign = ["company_admin", "coordinator"].includes(user?.role);

  const participantMap = useMemo(
    () => Object.fromEntries(participants.map((participant) => [participant.id, participant.fullName])),
    [participants],
  );
  const workerMap = useMemo(
    () => Object.fromEntries(workers.map((worker) => [worker.id, worker.fullName])),
    [workers],
  );

  const loadAll = async () => {
    try {
      const workerRequest = canAssign
        ? userService.list({ role: "support_worker" })
        : Promise.resolve({ data: { data: [] } });
      const [assignmentRes, participantRes, workerRes] = await Promise.all([
        assignmentService.list(),
        participantService.list(),
        workerRequest,
      ]);
      setAssignments(assignmentRes.data?.data || []);
      setParticipants(participantRes.data?.data || []);
      setWorkers(workerRes.data?.data || []);
    } catch (err) {
      setError(extractApiError(err, "Failed to load assignments"));
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canAssign]);

  const createAssignment = async (payload) => {
    setSaving(true);
    setError("");
    try {
      await assignmentService.create(payload);
      await loadAll();
    } catch (err) {
      setError(extractApiError(err, "Failed to create assignment"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Assignments" description="Map participants to support workers with company scope." />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {canAssign ? (
        <Card>
          <CardHeader>
            <CardTitle>Create Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <AssignmentForm
              participants={participants}
              workers={workers}
              onSubmit={createAssignment}
              loading={saving}
            />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Active Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Participant</TableHead>
                <TableHead>Worker</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>{participantMap[assignment.participantId] || assignment.participantId}</TableCell>
                  <TableCell>{workerMap[assignment.workerId] || assignment.workerId}</TableCell>
                  <TableCell>{assignment.status}</TableCell>
                  <TableCell>{assignment.assignedDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
