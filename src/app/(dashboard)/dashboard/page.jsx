"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/frontend/components/common/page-header";
import StatsCard from "@/frontend/components/cards/stats-card";
import QuickActions from "@/frontend/components/dashboard/quick-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { companyService } from "@/frontend/services/companyService";
import { extractApiError } from "@/frontend/services/http";
import { useCurrentUser } from "@/frontend/hooks/useCurrentUser";

export default function DashboardPage() {
  const [workspace, setWorkspace] = useState(null);
  const [error, setError] = useState("");
  const { user } = useCurrentUser();

  useEffect(() => {
    async function load() {
      try {
        const response = await companyService.getProfile();
        setWorkspace(response.data?.data);
      } catch (err) {
        setError(extractApiError(err, "Failed to load dashboard"));
      }
    }
    load();
  }, []);

  if (user?.role === "superadmin") {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-600">Use the platform navigation for superadmin modules.</p>
        <Link href="/superadmin-dashboard" className="text-sm font-medium text-[#2563EB]">
          Go to Superadmin Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Company Dashboard"
        description="Overview of your staff, participants, assignments, notes, and incidents."
      />

      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Total Staff"
          value={workspace?.metrics?.totalStaff || 0}
          helper="All roles in this company"
        />
        <StatsCard
          title="Total Participants"
          value={workspace?.metrics?.totalParticipants || 0}
          tone="teal"
          helper="Registered participant records"
        />
        <StatsCard
          title="Active Assignments"
          value={workspace?.metrics?.totalActiveAssignments || 0}
          tone="orange"
          helper="Current active support links"
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(workspace?.recentNotes || []).map((note) => (
              <div key={note.id} className="rounded-md border border-slate-200 p-3">
                <p className="text-sm font-medium">{note.noteTitle}</p>
                <p className="text-xs text-slate-500">{note.serviceDate}</p>
              </div>
            ))}
            {!workspace?.recentNotes?.length ? (
              <p className="text-sm text-slate-500">No notes available yet.</p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Incidents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(workspace?.recentIncidents || []).map((incident) => (
              <div key={incident.id} className="rounded-md border border-slate-200 p-3">
                <p className="text-sm font-medium">
                  {incident.incidentType} ({incident.severity})
                </p>
                <p className="text-xs text-slate-500">
                  {incident.incidentDate} - {incident.status}
                </p>
              </div>
            ))}
            {!workspace?.recentIncidents?.length ? (
              <p className="text-sm text-slate-500">No incidents available yet.</p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <QuickActions role={user?.role} />
      </div>
    </div>
  );
}
