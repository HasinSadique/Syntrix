import { requireAuthUser } from "@/backend/auth/guards";
import { ROLES } from "@/backend/constants/roles";
import { getDashboardStats } from "@/backend/services/dashboardService";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { SupportWorkerDashboard } from "@/components/dashboard/support-worker-dashboard";

export default async function DashboardPage() {
  const user = await requireAuthUser();

  if (user.role === ROLES.SUPPORT_WORKER) {
    return <SupportWorkerDashboard user={user} />;
  }

  const stats = await getDashboardStats(user);

  return <DashboardOverview user={user} stats={stats} />;
}
