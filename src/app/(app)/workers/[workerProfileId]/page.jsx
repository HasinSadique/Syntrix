import mongoose from "mongoose";
import { UserCircle2 } from "lucide-react";
import { notFound } from "next/navigation";
import { requireRoles } from "@/backend/auth/guards";
import { ROLES } from "@/backend/constants/roles";
import { connectToDatabase } from "@/backend/db/mongoose";
import { Assignment, AuditLog, Shift, WorkerProfile } from "@/backend/models";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function Field({ label, value }) {
  return (
    <div className="space-y-1 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
      <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{value || "—"}</p>
    </div>
  );
}

function formatDate(value) {
  if (!value) {
    return "—";
  }
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) {
    return "—";
  }
  return d.toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) {
    return "—";
  }
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) {
    return "—";
  }
  return d.toLocaleString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function WorkerProfileViewPage({ params }) {
  const user = await requireRoles([
    ROLES.SUPER_ADMIN,
    ROLES.COMPANY_ADMIN,
    ROLES.STATE_MANAGER,
    ROLES.CARE_MANAGER,
  ]);

  const { workerProfileId } = await params;
  if (!mongoose.Types.ObjectId.isValid(workerProfileId)) {
    notFound();
  }

  await connectToDatabase();
  const workerObjectId = new mongoose.Types.ObjectId(workerProfileId);
  const companyObjectId = new mongoose.Types.ObjectId(user.companyId);
  const worker = await WorkerProfile.findOne({
    _id: workerObjectId,
    companyId: companyObjectId,
  })
    .populate("userId", "firstName lastName email state phone status")
    .lean();

  if (!worker) {
    notFound();
  }

  const displayName =
    `${worker.userId?.firstName || ""} ${worker.userId?.lastName || ""}`.trim() ||
    "Support Worker";
  const now = new Date();
  const [assignments, upcomingShifts, workerLogs] = await Promise.all([
    Assignment.find({
      companyId: companyObjectId,
      workerUserId: worker.userId?._id,
      status: { $in: ["active", "paused"] },
    })
      .sort({ startDate: -1 })
      .populate("participantId", "firstName lastName ndisNumber state")
      .lean(),
    Shift.find({
      companyId: companyObjectId,
      workerUserId: worker.userId?._id,
      shiftDate: { $gte: now },
    })
      .sort({ shiftDate: 1, startTime: 1 })
      .limit(14)
      .populate("participantId", "firstName lastName")
      .lean(),
    AuditLog.find({
      companyId: companyObjectId,
      $or: [
        { entityType: "user", entityId: worker.userId?._id?.toString() },
        { entityType: "worker_profile", entityId: workerObjectId.toString() },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean(),
  ]);
  const groupedAvailability = upcomingShifts.reduce((acc, shift) => {
    const day = new Date(shift.shiftDate).toLocaleDateString("en-AU", {
      weekday: "long",
    });
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(`${shift.startTime} - ${shift.endTime}`);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border-none bg-linear-to-r from-violet-600 via-indigo-600 to-sky-600 text-white shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
                <UserCircle2 className="h-10 w-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">{displayName}</h2>
                <p className="text-sm text-violet-100">
                  Employee code: {worker.employeeCode || "—"}
                </p>
              </div>
            </div>
            <Badge
              variant={worker.userId?.status === "active" ? "success" : "warning"}
              className="bg-white/20 text-white hover:bg-white/20"
            >
              {worker.userId?.status || "unknown"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Field label="Profile ID" value={worker._id?.toString()} />
          <Field label="User ID" value={worker.userId?._id?.toString()} />
          <Field label="Email" value={worker.userId?.email} />
          <Field label="Phone" value={worker.userId?.phone} />
          <Field label="State" value={worker.userId?.state} />
          <Field label="Job title" value={worker.jobTitle} />
          <Field label="Employment type" value={worker.employmentType} />
          <Field label="Joined" value={formatDate(worker.joinedAt)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Availability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Field label="Current availability status" value={worker.availabilityStatus} />
          {upcomingShifts.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No upcoming rostered availability windows are scheduled.
            </p>
          ) : (
            <div className="space-y-2">
              {Object.entries(groupedAvailability).map(([day, windows]) => (
                <div
                  key={day}
                  className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
                >
                  <p className="text-sm font-medium">{day}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {windows.join(", ")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assigned participants</CardTitle>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No participant assignments found for this support worker.
            </p>
          ) : (
            <div className="space-y-2">
              {assignments.map((assignment) => {
                const participantName =
                  `${assignment.participantId?.firstName || ""} ${assignment.participantId?.lastName || ""}`.trim();
                return (
                  <div
                    key={assignment._id}
                    className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
                  >
                    <p className="text-sm font-medium">
                      {participantName || "Participant"}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      NDIS: {assignment.participantId?.ndisNumber || "—"} · State:{" "}
                      {assignment.participantId?.state || "—"} · Status: {assignment.status}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming shifts</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingShifts.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No upcoming shifts.
            </p>
          ) : (
            <div className="space-y-2">
              {upcomingShifts.map((shift) => {
                const participantName =
                  `${shift.participantId?.firstName || ""} ${shift.participantId?.lastName || ""}`.trim();
                return (
                  <div
                    key={shift._id}
                    className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
                  >
                    <p className="text-sm font-medium">
                      {formatDate(shift.shiftDate)} · {shift.startTime} - {shift.endTime}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {shift.serviceType} · {participantName || "Participant"}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {workerLogs.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No profile logs found.
            </p>
          ) : (
            <div className="space-y-2">
              {workerLogs.map((log) => (
                <div
                  key={log._id}
                  className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
                >
                  <p className="text-sm font-medium">{log.action}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formatDateTime(log.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
