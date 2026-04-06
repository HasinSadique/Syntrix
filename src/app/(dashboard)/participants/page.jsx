"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/frontend/components/common/page-header";
import ParticipantForm from "@/frontend/components/forms/participant-form";
import ParticipantTable from "@/frontend/components/tables/participant-table";
import { Button } from "@/frontend/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { participantService } from "@/frontend/services/participantService";
import { extractApiError } from "@/frontend/services/http";
import { useCurrentUser } from "@/frontend/hooks/useCurrentUser";

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { user } = useCurrentUser();

  const canEdit = ["company_admin", "manager", "coordinator"].includes(user?.role);

  const loadParticipants = async () => {
    try {
      const response = await participantService.list();
      setParticipants(response.data?.data || []);
    } catch (err) {
      setError(extractApiError(err, "Failed to load participants"));
    }
  };

  useEffect(() => {
    loadParticipants();
  }, []);

  const createParticipant = async (payload) => {
    setSaving(true);
    setError("");
    try {
      await participantService.create(payload);
      await loadParticipants();
    } catch (err) {
      setError(extractApiError(err, "Failed to create participant"));
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (participant) => {
    const status = participant.status === "active" ? "inactive" : "active";
    try {
      await participantService.update(participant.id, { status });
      await loadParticipants();
    } catch (err) {
      setError(extractApiError(err, "Failed to update participant"));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Participant Management"
        description="Create, view, and maintain participant records in your company workspace."
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {canEdit ? (
        <Card>
          <CardHeader>
            <CardTitle>Create Participant</CardTitle>
          </CardHeader>
          <CardContent>
            <ParticipantForm onSubmit={createParticipant} loading={saving} />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Participants</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ParticipantTable rows={participants} />
          {canEdit ? (
            <div className="flex flex-wrap gap-2">
              {participants.map((participant) => (
                <Button key={participant.id} size="sm" variant="outline" onClick={() => toggleStatus(participant)}>
                  {participant.fullName}: set {participant.status === "active" ? "inactive" : "active"}
                </Button>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
