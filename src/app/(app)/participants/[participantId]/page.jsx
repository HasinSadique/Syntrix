import mongoose from "mongoose";
import Link from "next/link";
import {
  CircleDollarSign,
  FileClock,
  NotebookText,
  Pencil,
  Siren,
  UserCircle2,
  UserPlus,
} from "lucide-react";
import { notFound } from "next/navigation";
import { requireRoles } from "@/backend/auth/guards";
import { ROLE_LABELS } from "@/backend/constants/roles";
import { ROLES } from "@/backend/constants/roles";
import { connectToDatabase } from "@/backend/db/mongoose";
import {
  AuditLog,
  Assignment,
  Document,
  Incident,
  Participant,
  ParticipantBudget,
  ParticipantPlan,
  Shift,
  ShiftNote,
} from "@/backend/models";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return "$0.00";
  }
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(amount);
}

function formatManagementType(value) {
  if (!value) {
    return "Not yet recorded";
  }
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatAuditAction(log) {
  if (log?.metadata?.description) {
    return log.metadata.description;
  }

  const actorName = log?.userId
    ? `${log.userId.firstName || ""} ${log.userId.lastName || ""}`.trim() || "Unknown user"
    : "Unknown user";

  const actorRole = ROLE_LABELS?.[log?.metadata?.actorRole] || "User";
  const action = log?.action?.toLowerCase() || "";
  const entityType = log?.entityType?.toLowerCase() || "";
  const targetName = `${log?.newValue?.firstName || ""} ${log?.newValue?.lastName || ""}`.trim();
  const targetRole = log?.newValue?.role
    ? ROLE_LABELS[log.newValue.role] || log.newValue.role
    : "User";

  if (action === "user.create") {
    const resolvedName = targetName || "new user";
    return `${targetRole} ${resolvedName} created by ${actorRole} ${actorName}`;
  }

  if (
    action.includes("update") &&
    (entityType.includes("worker") || entityType.includes("support_worker") || entityType === "user")
  ) {
    const resolvedName = targetName || actorName;
    return `${resolvedName} updated their profile`;
  }

  return log?.action || "Audit event";
}

function ListOrFallback({ items, fallback }) {
  if (!items || items.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{fallback}</p>
    );
  }

  return (
    <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-800 dark:text-zinc-200">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function Field({ label, value }) {
  return (
    <div className="space-y-1 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
      <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {value || "—"}
      </p>
    </div>
  );
}

export default async function ParticipantProfilePage({ params }) {
  const user = await requireRoles([
    ROLES.COMPANY_ADMIN,
    ROLES.STATE_MANAGER,
    ROLES.CARE_MANAGER,
  ]);

  const { participantId } = await params;
  if (!mongoose.Types.ObjectId.isValid(participantId)) {
    notFound();
  }

  await connectToDatabase();
  const participantObjectId = new mongoose.Types.ObjectId(participantId);
  const companyObjectId = new mongoose.Types.ObjectId(user.companyId);

  const participant = await Participant.findOne({
    _id: participantObjectId,
    companyId: companyObjectId,
  }).lean();

  if (!participant) {
    notFound();
  }

  const now = new Date();
  const [
    plan,
    budgets,
    upcomingShifts,
    recentShiftNotes,
    incidents,
    documents,
    assignments,
    participantLogs,
  ] = await Promise.all([
    ParticipantPlan.findOne({
      companyId: companyObjectId,
      participantId: participantObjectId,
    })
      .sort({ planStart: -1 })
      .lean(),
    ParticipantBudget.find({
      companyId: companyObjectId,
      participantId: participantObjectId,
    })
      .sort({ startDate: -1 })
      .lean(),
    Shift.find({
      companyId: companyObjectId,
      participantId: participantObjectId,
      shiftDate: { $gte: now },
    })
      .sort({ shiftDate: 1, startTime: 1 })
      .limit(8)
      .populate("workerUserId", "firstName lastName")
      .lean(),
    ShiftNote.find({ companyId: companyObjectId })
      .sort({ submittedAt: -1 })
      .limit(50)
      .populate({
        path: "shiftId",
        select: "participantId shiftDate startTime serviceType",
        match: { participantId: participantObjectId },
      })
      .lean(),
    Incident.find({
      companyId: companyObjectId,
      participantId: participantObjectId,
    })
      .sort({ reportedAt: -1 })
      .limit(10)
      .lean(),
    Document.find({
      companyId: companyObjectId,
      entityType: "participant",
      entityId: participantObjectId,
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean(),
    Assignment.find({
      companyId: companyObjectId,
      participantId: participantObjectId,
      status: "active",
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("workerUserId", "firstName lastName")
      .lean(),
    AuditLog.find({
      companyId: companyObjectId,
      entityType: "participant",
      entityId: participantObjectId.toString(),
    })
      .sort({ createdAt: -1 })
      .limit(15)
      .populate("userId", "firstName lastName")
      .lean(),
  ]);

  const progressNotes = recentShiftNotes.filter((note) => note.shiftId);
  const serviceAgreementDocs = documents.filter((doc) =>
    doc.documentType?.toLowerCase().includes("service agreement"),
  );
  const activeServiceAgreement = serviceAgreementDocs.find(
    (doc) => doc.fileUrl,
  );

  const budgetTotals = budgets.reduce(
    (acc, item) => {
      acc.allocated += Number(item.allocatedAmount || 0);
      acc.used += Number(item.usedAmount || 0);
      acc.remaining += Number(item.remainingAmount || 0);
      return acc;
    },
    { allocated: 0, used: 0, remaining: 0 },
  );
  const expenseNotes = progressNotes.filter(
    (note) => Number(note.expenseAmount || 0) > 0,
  );
  const totalExpenses = expenseNotes.reduce(
    (sum, note) => sum + Number(note.expenseAmount || 0),
    0,
  );
  const assignedWorkers = assignments
    .map((item) =>
      `${item.workerUserId?.firstName || ""} ${item.workerUserId?.lastName || ""}`.trim(),
    )
    .filter(Boolean);

  const fullName =
    `${participant.firstName || ""} ${participant.lastName || ""}`.trim();

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-none bg-linear-to-r from-violet-600 via-indigo-600 to-sky-600 text-white shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
                <UserCircle2 className="h-10 w-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">
                  {fullName || "Participant"}
                </h2>
                <p className="text-sm text-violet-100">
                  {participant.preferredName
                    ? `Preferred name: ${participant.preferredName}`
                    : "Participant digital profile"}
                </p>
                <p className="mt-1 text-xs text-violet-100/90">
                  NDIS: {participant.ndisNumber} · ID: {participant._id?.toString()}
                </p>
              </div>
            </div>
            <Badge
              variant={participant.status === "active" ? "success" : "warning"}
              className="bg-white/20 text-white hover:bg-white/20"
            >
              {participant.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Controls</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          <Button asChild variant="outline" className="justify-start">
            <Link href="#personal-medical">
              <Pencil className="h-4 w-4" />
              Edit personal and care details
            </Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link href="#funding-management">
              <Pencil className="h-4 w-4" />
              Edit funding and service details
            </Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link href="#participant-logs">
              <FileClock className="h-4 w-4" />
              View participant logs
            </Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link href="#worker-assignment">
              <UserPlus className="h-4 w-4" />
              {assignments.length === 0
                ? "Assign support worker"
                : "View assigned support workers"}
            </Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link href="#shift-notes">
              <NotebookText className="h-4 w-4" />
              View shift notes
            </Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link href="#incident-history">
              <Siren className="h-4 w-4" />
              View incident reports
            </Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link href="#expenses">
              <CircleDollarSign className="h-4 w-4" />
              View expenses
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card id="personal-medical">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>{fullName || "Participant"}</CardTitle>
          <Badge
            variant={participant.status === "active" ? "success" : "warning"}
          >
            {participant.status}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="text-base font-semibold">
            Essential Personal & Medical Identification
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Participant ID" value={participant._id?.toString()} />
            <Field label="NDIS Number" value={participant.ndisNumber} />
            <Field label="Full Name" value={fullName} />
            <Field label="Preferred Name" value={participant.preferredName} />
            <Field label="Date of Birth" value={formatDate(participant.dob)} />
            <Field label="Gender" value={participant.gender} />
            <Field
              label="Primary / Secondary Disability"
              value={
                [participant.primaryDisability, participant.secondaryDisability]
                  .filter(Boolean)
                  .join(" / ") || "Not yet recorded"
              }
            />
            <Field
              label="Medical Alerts & Risks"
              value={
                [...(participant.medicalAlerts || []), ...(participant.highRiskFlags || [])]
                  .filter(Boolean)
                  .join(", ") ||
                participant.epilepsyProtocol ||
                "No medical alerts or risk flags recorded"
              }
            />
            <Field label="Phone" value={participant.phone} />
            <Field label="State" value={participant.state} />
            <Field label="Address" value={participant.address} />
            <Field label="Created" value={formatDate(participant.createdAt)} />
          </div>
        </CardContent>
      </Card>

      <Card id="funding-management">
        <CardHeader>
          <CardTitle>Emergency Contacts</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Field label="Name" value={participant.emergencyContact?.name} />
          <Field label="Phone" value={participant.emergencyContact?.phone} />
          <Field
            label="Relationship"
            value={participant.emergencyContact?.relationship}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Funding & Service Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="Plan Start" value={formatDate(plan?.planStart)} />
            <Field label="Plan End" value={formatDate(plan?.planEnd)} />
            <Field
              label="Management Type"
              value={formatManagementType(participant.managementType)}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Budget Tracking (by support category)
            </p>
            {budgets.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No budget categories recorded for this participant yet.
              </p>
            ) : (
              <div className="space-y-3">
                {budgets.map((item) => {
                  const allocated = Number(item.allocatedAmount || 0);
                  const used = Number(item.usedAmount || 0);
                  const usedPercent =
                    allocated > 0 ? Math.min((used / allocated) * 100, 100) : 0;
                  return (
                    <div key={item._id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{item.categoryName}</span>
                        <span className="text-zinc-600 dark:text-zinc-400">
                          {formatCurrency(used)} / {formatCurrency(allocated)}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-800">
                        <div
                          className="h-2 rounded-full bg-emerald-500"
                          style={{ width: `${usedPercent}%` }}
                        />
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Remaining: {formatCurrency(item.remainingAmount)}
                      </p>
                    </div>
                  );
                })}
                <div className="grid gap-3 rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800 md:grid-cols-3">
                  <p>
                    <span className="text-zinc-500 dark:text-zinc-400">
                      Total funds:
                    </span>{" "}
                    {formatCurrency(budgetTotals.allocated)}
                  </p>
                  <p>
                    <span className="text-zinc-500 dark:text-zinc-400">
                      Spent:
                    </span>{" "}
                    {formatCurrency(budgetTotals.used)}
                  </p>
                  <p>
                    <span className="text-zinc-500 dark:text-zinc-400">
                      Remaining:
                    </span>{" "}
                    {formatCurrency(budgetTotals.remaining)}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Service Agreements
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <Field
                label="Active signed agreement"
                value={
                  activeServiceAgreement?.fileUrl ? (
                    <Link
                      href={activeServiceAgreement.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Open agreement
                    </Link>
                  ) : (
                    "No signed file linked yet"
                  )
                }
              />
              <Field
                label="Agreement status"
                value={
                  plan?.serviceAgreementStatus || "No plan status recorded"
                }
              />
            </div>
            <ListOrFallback
              items={serviceAgreementDocs.slice(0, 5).map((doc) => {
                const when = formatDate(doc.createdAt);
                return `${doc.documentType} (${when})`;
              })}
              fallback="No service agreement versions uploaded yet."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Care & Goal Documentation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div id="shift-notes">
            <p className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Participant Goals
            </p>
            <ListOrFallback
              items={plan?.goals}
              fallback="No participant goals are recorded in the current plan."
            />
          </div>

          <div id="incident-history">
            <p className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Support Plan
            </p>
            <ListOrFallback
              items={[
                ...(plan?.supportNeeds || []),
                ...(plan?.preferences || []),
              ]}
              fallback="No support plan instructions captured yet."
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Progress Notes (latest first)
            </p>
            {progressNotes.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No progress notes are available for this participant yet.
              </p>
            ) : (
              <div className="space-y-2">
                {progressNotes.slice(0, 8).map((note) => (
                  <div
                    key={note._id}
                    className="rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800"
                  >
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {formatDateTime(note.submittedAt)} ·{" "}
                      {formatDate(note.shiftId?.shiftDate)}{" "}
                      {note.shiftId?.startTime || ""}
                    </p>
                    <p className="mt-1 text-zinc-800 dark:text-zinc-200">
                      {note.noteText}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Incident History
            </p>
            {incidents.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No incidents have been logged for this participant.
              </p>
            ) : (
              <div className="space-y-2">
                {incidents.map((incident) => (
                  <div
                    key={incident._id}
                    className="rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800"
                  >
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {formatDateTime(incident.reportedAt)} ·{" "}
                      {incident.severity} · {incident.status}
                    </p>
                    <p className="mt-1 font-medium">{incident.category}</p>
                    <p className="text-zinc-700 dark:text-zinc-300">
                      {incident.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card id="worker-assignment">
        <CardHeader>
          <CardTitle>Operational & Administrative Records</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Upcoming Appointments
            </p>
            {upcomingShifts.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No upcoming appointments are scheduled.
              </p>
            ) : (
              <div className="space-y-2">
                {upcomingShifts.map((shift) => {
                  const workerName =
                    `${shift.workerUserId?.firstName || ""} ${shift.workerUserId?.lastName || ""}`.trim();
                  return (
                    <div
                      key={shift._id}
                      className="rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800"
                    >
                      <p className="font-medium">
                        {formatDate(shift.shiftDate)} · {shift.startTime} -{" "}
                        {shift.endTime}
                      </p>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        {shift.serviceType} ·{" "}
                        {workerName || "Unassigned worker"}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Field
              label="Staff Ratios"
              value={
                participant.staffRatio
                  ? `${participant.staffRatio} required`
                  : `${assignments.length} active worker assignment(s). Ratio not recorded`
              }
            />
            <Field
              label="Active Worker Assignments"
              value={assignments.length.toString()}
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Assigned Support Workers
            </p>
            <ListOrFallback
              items={assignedWorkers}
              fallback="No active support worker assignment for this participant."
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Document Library
            </p>
            {documents.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No participant documents uploaded yet.
              </p>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc._id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800"
                  >
                    <div>
                      <p className="font-medium">{doc.documentType}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Uploaded {formatDate(doc.createdAt)} ·{" "}
                        {doc.verificationStatus}
                      </p>
                    </div>
                    {doc.fileUrl ? (
                      <Link
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline dark:text-blue-400"
                      >
                        Open file
                      </Link>
                    ) : (
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        No file URL
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card id="participant-logs">
        <CardHeader>
          <CardTitle>Participant Logs & Audit Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Created At" value={formatDateTime(participant.createdAt)} />
            <Field label="Last Updated" value={formatDateTime(participant.updatedAt)} />
          </div>
          {participantLogs.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No audit events found for this participant yet.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-zinc-100 text-xs uppercase tracking-wide text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Time</th>
                    <th className="px-4 py-3 font-semibold">Description</th>
                    <th className="px-4 py-3 font-semibold">Performed By</th>
                  </tr>
                </thead>
                <tbody>
                  {participantLogs.map((log) => (
                    <tr
                      key={log._id}
                      className="border-t border-zinc-200 dark:border-zinc-800"
                    >
                      <td className="px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                        {formatAuditAction(log)}
                      </td>
                      <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                        {log.userId
                          ? `${log.userId.firstName || ""} ${log.userId.lastName || ""}`.trim() ||
                            "Unknown user"
                          : "Unknown user"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card id="expenses">
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Total Submitted Expenses" value={formatCurrency(totalExpenses)} />
            <Field label="Expense Entries" value={expenseNotes.length.toString()} />
          </div>
          {expenseNotes.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No expense entries have been submitted in shift notes.
            </p>
          ) : (
            <div className="space-y-2">
              {expenseNotes.slice(0, 12).map((note) => (
                <div
                  key={note._id}
                  className="rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800"
                >
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formatDateTime(note.submittedAt)}
                  </p>
                  <p className="mt-1 font-medium">
                    {formatCurrency(note.expenseAmount)} · {note.shiftId?.serviceType || "Shift"}
                  </p>
                  <p className="text-zinc-600 dark:text-zinc-400">{note.noteText}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
