import { requireAuthUser } from "@/backend/auth/guards";
import { ROLES } from "@/backend/constants/roles";
import { SupportWorkerSchedule } from "@/components/workers/support-worker-schedule";
import { ComingSoonPanel } from "@/components/common/coming-soon-panel";
import { Card, CardContent } from "@/components/ui/card";

export default async function SchedulePage() {
  const user = await requireAuthUser();

  if (user.role === ROLES.SUPER_ADMIN && !user.activeCompanyId) {
    return (
      <Card>
        <CardContent className="pt-5">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Select a company from the sidebar to open company tools. Support worker schedule
            is available to support worker accounts.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (user.role !== ROLES.SUPPORT_WORKER) {
    return (
      <ComingSoonPanel
        title="Schedule"
        description="The team schedule view for managers is part of rostering. Support workers have their own schedule page in the navigation."
      />
    );
  }

  return <SupportWorkerSchedule user={user} />;
}
