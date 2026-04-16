import { requireAuthUser } from "@/backend/auth/guards";
import { getDashboardStats } from "@/backend/services/dashboardService";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";

export default async function DashboardPage() {
  const user = await requireAuthUser();
  const stats = await getDashboardStats(user);

  return <DashboardOverview user={user} stats={stats} />;
}
