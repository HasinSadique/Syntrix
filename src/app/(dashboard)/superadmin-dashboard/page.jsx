"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/frontend/components/common/page-header";
import StatsCard from "@/frontend/components/cards/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { companyService } from "@/frontend/services/companyService";
import { extractApiError } from "@/frontend/services/http";
import { useCurrentUser } from "@/frontend/hooks/useCurrentUser";

export default function SuperadminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");
  const { user } = useCurrentUser();

  useEffect(() => {
    async function load() {
      try {
        const response = await companyService.getSuperadminDashboard();
        setDashboard(response.data?.data);
      } catch (err) {
        setError(extractApiError(err, "Failed to load superadmin dashboard"));
      }
    }
    if (user?.role === "superadmin") {
      load();
    }
  }, [user?.role]);

  if (user && user.role !== "superadmin") {
    return <p className="text-sm text-slate-600">Only superadmin can access this page.</p>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Platform Dashboard" description="Monitor platform-wide metrics across all companies." />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard title="Total Companies" value={dashboard?.stats?.totalCompanies || 0} />
        <StatsCard title="Total Users" value={dashboard?.stats?.totalUsers || 0} tone="teal" />
        <StatsCard title="Total Participants" value={dashboard?.stats?.totalParticipants || 0} tone="green" />
        <StatsCard title="Total Incidents" value={dashboard?.stats?.totalIncidents || 0} tone="orange" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Companies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(dashboard?.recentCompanies || []).map((company) => (
            <div key={company.id} className="rounded-md border border-slate-200 p-3">
              <p className="text-sm font-medium">{company.companyName}</p>
              <p className="text-xs text-slate-500">
                {company.email} - {company.status}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
