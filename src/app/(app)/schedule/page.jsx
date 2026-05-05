import { requireAuthUser } from "@/backend/auth/guards";
import { ROLES } from "@/backend/constants/roles";
import { connectToDatabase } from "@/backend/db/mongoose";
import { Assignment, Shift } from "@/backend/models";
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

  await connectToDatabase();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const upcomingShifts = await Shift.find({
    companyId: user.companyId,
    workerUserId: user.id,
    shiftDate: { $gte: startOfToday },
  })
    .sort({ shiftDate: 1, startTime: 1 })
    .limit(24)
    .populate("participantId", "firstName lastName")
    .lean();

  const activeAssignments = await Assignment.find({
    companyId: user.companyId,
    workerUserId: user.id,
    status: { $in: ["active", "paused"] },
    endDate: { $gte: startOfToday },
  })
    .sort({ startDate: 1 })
    .limit(40)
    .populate("participantId", "firstName lastName")
    .lean();

  return (
    <SupportWorkerSchedule
      user={user}
      upcomingShifts={upcomingShifts}
      activeAssignments={activeAssignments}
    />
  );
}
