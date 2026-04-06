"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/frontend/components/common/page-header";
import IncidentForm from "@/frontend/components/forms/incident-form";
import IncidentTable from "@/frontend/components/tables/incident-table";
import { Button } from "@/frontend/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { incidentService } from "@/frontend/services/incidentService";
import { participantService } from "@/frontend/services/participantService";
import { extractApiError } from "@/frontend/services/http";
import { useCurrentUser } from "@/frontend/hooks/useCurrentUser";

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const { user } = useCurrentUser();

  const canManageStatus = ["company_admin", "manager", "coordinator"].includes(user?.role);

  const loadAll = async () => {
    try {
      const [incidentRes, participantRes] = await Promise.all([incidentService.list(), participantService.list()]);
      const participantRecords = participantRes.data?.data || [];
      const participantLookup = Object.fromEntries(
        participantRecords.map((participant) => [participant.id, participant.fullName]),
      );
      const records = incidentRes.data?.data || [];
      setIncidents(
        records.map((record) => ({
          ...record,
          participantName: participantLookup[record.participantId] || record.participantId,
        })),
      );
      setParticipants(participantRecords);
    } catch (err) {
      setError(extractApiError(err, "Failed to load incidents"));
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const createIncident = async (payload) => {
    setSaving(true);
    setError("");
    try {
      await incidentService.create(payload);
      await loadAll();
    } catch (err) {
      setError(extractApiError(err, "Failed to submit incident"));
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (incident, status) => {
    try {
      await incidentService.updateStatus(incident.id, status);
      await loadAll();
    } catch (err) {
      setError(extractApiError(err, "Failed to update incident"));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Incidents" description="Submit and monitor participant incident reports." />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Submit Incident</CardTitle>
        </CardHeader>
        <CardContent>
          <IncidentForm participants={participants} onSubmit={createIncident} loading={saving} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Incident Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <IncidentTable rows={incidents} />
          {canManageStatus ? (
            <div className="flex flex-wrap gap-2">
              {incidents.map((incident) => (
                <div key={incident.id} className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setStatus(incident, "reviewing")}>
                    {incident.id}: reviewing
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setStatus(incident, "resolved")}>
                    {incident.id}: resolved
                  </Button>
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
