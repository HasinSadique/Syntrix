"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatServiceTypeLabel(serviceType) {
  if (!serviceType?.trim()) {
    return "";
  }
  return serviceType
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function formatSessionDate(isoDate) {
  if (!isoDate) return "—";
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateRangeLine(startIso, endIso) {
  if (!startIso || !endIso) return "—";
  return `${formatSessionDate(startIso)} – ${formatSessionDate(endIso)}`;
}

function formatHm(hhmm) {
  if (!hhmm) return "—";
  const s = String(hhmm).trim();
  if (!/^\d{1,2}:\d{2}$/.test(s) && !/^\d{2}:\d{2}$/.test(s)) {
    return s || "—";
  }
  const [h, m] = s.split(":").map(Number);
  const ref = new Date();
  ref.setHours(h, m, 0, 0);
  return ref.toLocaleTimeString("en-AU", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatTimeRange(start, end) {
  return `${formatHm(start)} – ${formatHm(end)}`;
}

function personName(person) {
  if (!person) return "—";
  const n = `${person.firstName || ""} ${person.lastName || ""}`.trim();
  return n || "—";
}

/** Supports setup (assignment) vs single scheduled shift */
function isAssignmentSession(s) {
  if (!s) return false;
  if (s.recordType === "assignment") return true;
  if (s.recordType === "shift") return false;
  return Boolean(s.dateRangeStart && s.dateRangeEnd && !s.shiftDate);
}

function displayTitle(s) {
  const raw = typeof s.supportTitle === "string" ? s.supportTitle.trim() : "";
  if (raw) return raw;
  const fromService = formatServiceTypeLabel(s.serviceType);
  if (fromService) return fromService;
  return isAssignmentSession(s) ? "Support arrangement" : "Scheduled shift";
}

function normalizeSessions(sessions) {
  if (!Array.isArray(sessions)) return [];
  return sessions.map((s) => {
    const recordType = isAssignmentSession(s) ? "assignment" : "shift";
    const supportTitle = displayTitle({ ...s, recordType });
    const supportDescription =
      typeof s.supportDescription === "string" ? s.supportDescription : "";
    return {
      ...s,
      recordType,
      supportTitle,
      supportDescription,
    };
  });
}

function DetailRow({ label, value, className, multiline }) {
  return (
    <div
      className={cn(
        "space-y-1 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800",
        className,
      )}
    >
      <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p
        className={cn(
          "text-sm font-medium text-zinc-900 dark:text-zinc-100",
          multiline && "whitespace-pre-wrap break-words font-normal",
        )}
      >
        {value ?? "—"}
      </p>
    </div>
  );
}

function cardDateLine(session) {
  if (isAssignmentSession(session)) {
    return formatDateRangeLine(session.dateRangeStart, session.dateRangeEnd);
  }
  return formatSessionDate(session.shiftDate);
}

export function ParticipantSupportSessionsSection({
  participantId,
  sessions: sessionsProp,
}) {
  const router = useRouter();
  const sessions = useMemo(
    () => normalizeSessions(sessionsProp),
    [sessionsProp],
  );

  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const closeModal = useCallback(() => {
    setSelected(null);
    setDeleteError(null);
  }, []);

  useEffect(() => {
    if (!selected) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, closeModal]);

  async function handleDelete() {
    if (!selected) return;

    const isAssignment = isAssignmentSession(selected);
    const ok = window.confirm(
      isAssignment
        ? "Remove this support arrangement from the participant? Individual calendar shifts are not affected."
        : "Delete this scheduled shift? Related shift notes will also be removed.",
    );
    if (!ok) return;

    setDeleting(true);
    setDeleteError(null);
    try {
      const url = isAssignment
        ? `/api/assignments/${selected.id}?participantId=${encodeURIComponent(participantId)}`
        : `/api/shifts/${selected.id}?participantId=${encodeURIComponent(participantId)}`;
      const res = await fetch(url, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Could not delete");
      }
      closeModal();
      router.refresh();
    } catch (err) {
      setDeleteError(err.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  if (!sessions.length) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        No upcoming support sessions are scheduled for this participant.
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {sessions.map((session) => (
          <button
            key={`${session.recordType}-${session.id}`}
            type="button"
            onClick={() => {
              setDeleteError(null);
              setSelected(session);
            }}
            className={cn(
              "flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-4 text-left shadow-sm transition-colors",
              "hover:border-violet-300 hover:bg-violet-50/40 dark:border-zinc-800 dark:bg-zinc-950/40 dark:hover:border-violet-700 dark:hover:bg-violet-950/20",
            )}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-violet-600 dark:text-violet-400">
              {isAssignmentSession(session) ? "Support setup" : "Scheduled shift"}
            </p>
            <p className="text-sm font-semibold leading-snug text-zinc-900 dark:text-zinc-100">
              {session.supportTitle}
            </p>
            {isAssignmentSession(session) && session.supportDescription ? (
              <p className="line-clamp-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                {session.supportDescription}
              </p>
            ) : null}
            {!isAssignmentSession(session) && session.serviceType ? (
              <p className="line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">
                {formatServiceTypeLabel(session.serviceType)}
              </p>
            ) : null}
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              {cardDateLine(session)}
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              {formatTimeRange(session.startTime, session.endTime)}
            </p>
            <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
              {personName(session.worker)}
            </p>
          </button>
        ))}
      </div>

      {selected ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
            role="dialog"
            aria-modal="true"
            aria-labelledby="session-detail-title"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-xs font-medium uppercase tracking-wide text-violet-600 dark:text-violet-400">
                  {isAssignmentSession(selected)
                    ? "Support setup"
                    : "Scheduled shift"}
                </p>
                <h4
                  id="session-detail-title"
                  className="mt-1 break-words text-lg font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  {selected.supportTitle}
                </h4>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="shrink-0 rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isAssignmentSession(selected) ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <DetailRow
                  className="sm:col-span-2"
                  label="Date range"
                  value={formatDateRangeLine(
                    selected.dateRangeStart,
                    selected.dateRangeEnd,
                  )}
                />
                <DetailRow
                  label="Time"
                  value={formatTimeRange(
                    selected.startTime,
                    selected.endTime,
                  )}
                />
                <DetailRow
                  label="Days"
                  value={selected.routineDaysLabel || "—"}
                />
                <DetailRow label="Status" value={selected.status || "—"} />
                <DetailRow
                  className="sm:col-span-2"
                  label="Description"
                  multiline
                  value={
                    selected.supportDescription?.trim()
                      ? selected.supportDescription.trim()
                      : "No description provided."
                  }
                />
                {selected.createdAt ? (
                  <DetailRow
                    label="Recorded"
                    value={formatSessionDate(selected.createdAt)}
                  />
                ) : null}
                {selected.updatedAt &&
                selected.updatedAt !== selected.createdAt ? (
                  <DetailRow
                    label="Last updated"
                    value={formatSessionDate(selected.updatedAt)}
                  />
                ) : null}
              </div>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <DetailRow
                  label="Date"
                  value={formatSessionDate(selected.shiftDate)}
                />
                <DetailRow
                  label="Time"
                  value={formatTimeRange(
                    selected.startTime,
                    selected.endTime,
                  )}
                />
                <DetailRow label="Status" value={selected.status || "—"} />
                <DetailRow
                  label="Approval"
                  value={selected.approvalStatus || "—"}
                />
                <DetailRow
                  label="Location"
                  value={selected.location?.trim() || "—"}
                />
                <DetailRow
                  label="Service type"
                  value={
                    formatServiceTypeLabel(selected.serviceType) ||
                    selected.serviceType ||
                    "—"
                  }
                />
                {selected.createdAt ? (
                  <DetailRow
                    label="Recorded"
                    value={formatSessionDate(selected.createdAt)}
                  />
                ) : null}
              </div>
            )}

            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Support worker
            </p>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <DetailRow label="Name" value={personName(selected.worker)} />
              <DetailRow label="Email" value={selected.worker?.email || "—"} />
              <DetailRow label="Phone" value={selected.worker?.phone || "—"} />
            </div>

            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Care manager
            </p>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <DetailRow
                label="Name"
                value={personName(selected.careManager)}
              />
              <DetailRow
                label="Email"
                value={selected.careManager?.email || "—"}
              />
              <DetailRow
                label="Phone"
                value={selected.careManager?.phone || "—"}
              />
            </div>

            {deleteError ? (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                {deleteError}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
              <Button type="button" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button
                type="button"
                variant="danger"
                disabled={deleting}
                onClick={handleDelete}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {deleting
                  ? "Deleting…"
                  : isAssignmentSession(selected)
                    ? "Remove setup"
                    : "Delete shift"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
