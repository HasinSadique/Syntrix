import { requireAuthUser } from "@/backend/auth/guards";
import { ROLES } from "@/backend/constants/roles";
import { getDashboardStats } from "@/backend/services/dashboardService";
import { getSupportWorkerDashboardContext } from "@/backend/services/supportWorkerDashboardService";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { SupportWorkerDashboard } from "@/components/dashboard/support-worker-dashboard";

export default async function DashboardPage() {
  const user = await requireAuthUser();

  if (user.role === ROLES.SUPPORT_WORKER) {
    const raw = await getSupportWorkerDashboardContext(user);
    const dashboardPayload = JSON.parse(JSON.stringify(raw));
    return (
      <SupportWorkerDashboard user={user} dashboard={dashboardPayload} />
    );
  }

  const stats = await getDashboardStats(user);

  return <DashboardOverview user={user} stats={stats} />;
}
