import { requireRoles } from "@/backend/auth/guards";
import { ROLES } from "@/backend/constants/roles";
import { SupportWorkerProfile } from "@/components/workers/support-worker-profile";

export default async function ProfilePage() {
  const user = await requireRoles([ROLES.SUPPORT_WORKER]);

  return <SupportWorkerProfile user={user} />;
}
