import { requireRoles } from "@/backend/auth/guards";
import { ROLES } from "@/backend/constants/roles";
import { SupportWorkerAvailability } from "@/components/workers/support-worker-availability";

export default async function ScheduleAvailabilityPage() {
  const user = await requireRoles([ROLES.SUPPORT_WORKER]);

  return <SupportWorkerAvailability user={user} />;
}
