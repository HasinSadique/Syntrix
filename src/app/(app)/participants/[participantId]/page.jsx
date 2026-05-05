import mongoose from "mongoose";
import Link from "next/link";
import { UserCircle2 } from "lucide-react";
import { notFound } from "next/navigation";
import { requireRoles } from "@/backend/auth/guards";
import { ROLE_LABELS } from "@/backend/constants/roles";
import { ROLES } from "@/backend/constants/roles";
import { connectToDatabase } from "@/backend/db/mongoose";
import {
  Assignment,
  AuditLog,
  Document,
  Incident,
  Participant,
  ParticipantBudget,
  ParticipantPlan,
  Shift,
  ShiftNote,
} from "@/backend/models";
import { ROUTINE_DAYS } from "@/lib/supportRoutine";
import {
  ParticipantProfileAccordion,
  ParticipantProfileAccordionSection,
} from "@/components/participants/participant-profile-accordion";
import { ParticipantProfileQuickControls } from "@/components/participants/participant-profile-quick-controls";
import { ParticipantSupportSessionsSection } from "@/components/participants/participant-support-sessions-section";
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
    ? `${log.userId.firstName || ""} ${log.userId.lastName || ""}`.trim() ||
      "Unknown user"
    : "Unknown user";

  const actorRole = ROLE_LABELS?.[log?.metadata?.actorRole] || "User";
  const action = log?.action?.toLowerCase() || "";
  const entityType = log?.entityType?.toLowerCase() || "";
  const targetName =
    `${log?.newValue?.firstName || ""} ${log?.newValue?.lastName || ""}`.trim();
  const targetRole = log?.newValue?.role
    ? ROLE_LABELS[log.newValue.role] || log.newValue.role
    : "User";

  if (action === "user.create") {
    const resolvedName = targetName || "new user";
    return `${targetRole} ${resolvedName} created by ${actorRole} ${actorName}`;
  }

  if (
    action.includes("update") &&
    (entityType.includes("worker") ||
      entityType.includes("support_worker") ||
      entityType === "user")
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

function formatSupportSessionTitle(serviceType) {
  if (!serviceType?.trim()) {
    return "Support session";
  }
  return serviceType
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function formatRoutineDayLabels(keys) {
  if (!keys?.length) {
    return "—";
  }
  const map = Object.fromEntries(ROUTINE_DAYS.map((d) => [d.key, d.label]));
  return keys.map((k) => map[k] || k).join(", ");
}

function buildSupportSessionsList(shifts, assignments) {
  const shiftItems = shifts.map((s) => ({
    recordType: "shift",
    sortKey: new Date(s.shiftDate).getTime(),
    id: s._id.toString(),
    supportTitle: formatSupportSessionTitle(s.serviceType),
    serviceType: s.serviceType,
    shiftDate: s.shiftDate ? new Date(s.shiftDate).toISOString() : null,
    dateRangeStart: null,
    dateRangeEnd: null,
    routineDayKeys: [],
    routineDaysLabel: null,
    supportDescription: "",
    startTime: s.startTime,
    endTime: s.endTime,
    location: s.location || "",
    status: s.status,
    approvalStatus: s.approvalStatus,
    createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : null,
    updatedAt: s.updatedAt ? new Date(s.updatedAt).toISOString() : null,
    worker: s.workerUserId
      ? {
          firstName: s.workerUserId.firstName || "",
          lastName: s.workerUserId.lastName || "",
          email: s.workerUserId.email || "",
          phone: s.workerUserId.phone || "",
        }
      : null,
    careManager: s.careManagerUserId
      ? {
          firstName: s.careManagerUserId.firstName || "",
          lastName: s.careManagerUserId.lastName || "",
          email: s.careManagerUserId.email || "",
          phone: s.careManagerUserId.phone || "",
        }
      : null,
  }));

  const assignmentItems = assignments.map((a) => ({
    recordType: "assignment",
    sortKey: new Date(a.startDate).getTime(),
    id: a._id.toString(),
    supportTitle:
      String(a.supportTitle ?? "")
        .trim()
        .slice(0, 500) || "Support arrangement",
    serviceType: null,
    shiftDate: null,
    dateRangeStart: a.startDate ? new Date(a.startDate).toISOString() : null,
    dateRangeEnd: a.endDate ? new Date(a.endDate).toISOString() : null,
    routineDayKeys: Array.isArray(a.routineDayKeys) ? a.routineDayKeys : [],
    routineDaysLabel: formatRoutineDayLabels(a.routineDayKeys),
    supportDescription: String(a.supportDescription ?? "").trim().slice(0, 8000),
    startTime: a.routineStartTime || "",
    endTime: a.routineEndTime || "",
    location: "",
    status: a.status,
    approvalStatus: null,
    createdAt: a.createdAt ? new Date(a.createdAt).toISOString() : null,
    updatedAt: a.updatedAt ? new Date(a.updatedAt).toISOString() : null,
    worker: a.workerUserId
      ? {
          firstName: a.workerUserId.firstName || "",
          lastName: a.workerUserId.lastName || "",
          email: a.workerUserId.email || "",
          phone: a.workerUserId.phone || "",
        }
      : null,
    careManager: a.careManagerUserId
      ? {
          firstName: a.careManagerUserId.firstName || "",
          lastName: a.careManagerUserId.lastName || "",
          email: a.careManagerUserId.email || "",
          phone: a.careManagerUserId.phone || "",
        }
      : null,
  }));

  const merged = [...shiftItems, ...assignmentItems]
    .sort((x, y) => x.sortKey - y.sortKey)
    .map(({ sortKey: _s, ...rest }) => rest);

  return JSON.parse(JSON.stringify(merged));
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
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    plan,
    budgets,
    upcomingShifts,
    activeSupportAssignments,
    recentShiftNotes,
    incidents,
    documents,
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
      .limit(60)
      .populate("workerUserId", "firstName lastName email phone")
      .populate("careManagerUserId", "firstName lastName email phone")
      .lean(),
    Assignment.find({
      companyId: companyObjectId,
      participantId: participantObjectId,
      status: "active",
      endDate: { $gte: startOfToday },
    })
      .sort({ startDate: 1 })
      .limit(60)
      .populate("workerUserId", "firstName lastName email phone")
      .populate("careManagerUserId", "firstName lastName email phone")
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
                  NDIS: {participant.ndisNumber} · ID:{" "}
                  {participant._id?.toString()}
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

      <ParticipantProfileAccordion>
        <ParticipantProfileQuickControls participantId={participantId} />
        <ParticipantProfileAccordionSection
          sectionId="personal-medical"
          title="Essential Personal & Medical Identification"
        >
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
                [
                  ...(participant.medicalAlerts || []),
                  ...(participant.highRiskFlags || []),
                ]
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
        </ParticipantProfileAccordionSection>

        <ParticipantProfileAccordionSection
          sectionId="emergency-contacts"
          title="Emergency Contacts"
          contentClassName="grid gap-3 md:grid-cols-3"
        >
          <Field label="Name" value={participant.emergencyContact?.name} />
          <Field label="Phone" value={participant.emergencyContact?.phone} />
          <Field
            label="Relationship"
            value={participant.emergencyContact?.relationship}
          />
        </ParticipantProfileAccordionSection>

        <ParticipantProfileAccordionSection
          sectionId="funding-management"
          title="Funding & Service Management"
          contentClassName="space-y-4"
        >
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
        </ParticipantProfileAccordionSection>

        <ParticipantProfileAccordionSection
          sectionId="care-documentation"
          title="Care & Goal Documentation"
          contentClassName="space-y-4"
        >
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
        </ParticipantProfileAccordionSection>

        <ParticipantProfileAccordionSection
          sectionId="worker-assignment"
          title="Upcoming support sessions"
          contentClassName="space-y-4"
        >
          <ParticipantSupportSessionsSection
            participantId={participantId}
            sessions={buildSupportSessionsList(
              upcomingShifts,
              activeSupportAssignments,
            )}
          />
        </ParticipantProfileAccordionSection>

        <ParticipantProfileAccordionSection
          sectionId="participant-logs"
          title="Participant Logs & Audit Timeline"
          contentClassName="space-y-3"
        >
          <div className="grid gap-3 md:grid-cols-2">
            <Field
              label="Created At"
              value={formatDateTime(participant.createdAt)}
            />
            <Field
              label="Last Updated"
              value={formatDateTime(participant.updatedAt)}
            />
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
        </ParticipantProfileAccordionSection>

        <ParticipantProfileAccordionSection
          sectionId="expenses"
          title="Expenses"
          contentClassName="space-y-3"
        >
          <div className="grid gap-3 md:grid-cols-2">
            <Field
              label="Total Submitted Expenses"
              value={formatCurrency(totalExpenses)}
            />
            <Field
              label="Expense Entries"
              value={expenseNotes.length.toString()}
            />
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
                    {formatCurrency(note.expenseAmount)} ·{" "}
                    {note.shiftId?.serviceType || "Shift"}
                  </p>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    {note.noteText}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ParticipantProfileAccordionSection>
      </ParticipantProfileAccordion>
    </div>
  );
}
