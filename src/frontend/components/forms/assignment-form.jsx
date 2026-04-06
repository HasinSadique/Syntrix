"use client";

import { useMemo, useState } from "react";
import { Button } from "@/frontend/components/ui/button";
import { Label } from "@/frontend/components/ui/label";
import { Select } from "@/frontend/components/ui/select";

export default function AssignmentForm({ workers = [], participants = [], onSubmit, loading }) {
  const [participantId, setParticipantId] = useState("");
  const [workerId, setWorkerId] = useState("");
  const [status, setStatus] = useState("active");

  const canSubmit = useMemo(() => participantId && workerId, [participantId, workerId]);

  const submit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    await onSubmit({ participantId, workerId, status });
    setParticipantId("");
    setWorkerId("");
    setStatus("active");
  };

  return (
    <form onSubmit={submit} className="grid gap-4 md:grid-cols-3">
      <div className="space-y-2">
        <Label>Participant</Label>
        <Select value={participantId} onChange={(e) => setParticipantId(e.target.value)} required>
          <option value="">Select participant</option>
          {participants.map((participant) => (
            <option key={participant.id} value={participant.id}>
              {participant.fullName}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Support Worker</Label>
        <Select value={workerId} onChange={(e) => setWorkerId(e.target.value)} required>
          <option value="">Select worker</option>
          {workers.map((worker) => (
            <option key={worker.id} value={worker.id}>
              {worker.fullName}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </Select>
      </div>
      <div className="md:col-span-3">
        <Button type="submit" disabled={!canSubmit || loading}>
          {loading ? "Assigning..." : "Create Assignment"}
        </Button>
      </div>
    </form>
  );
}
