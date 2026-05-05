"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  ROUTINE_DAYS,
  getWorkerSupportRoutineMatchLevel,
} from "@/lib/supportRoutine";

function todayISO() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function nextMonthISO() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function makeInitialDays() {
  return ROUTINE_DAYS.reduce((acc, day) => {
    acc[day.key] = false;
    return acc;
  }, {});
}

export function SupportSetupForm({
  participantId,
  participant,
  workers,
  careManagerUserId,
}) {
  const router = useRouter();
  const [supportTitle, setSupportTitle] = useState("");
  const [supportDescription, setSupportDescription] = useState("");
  const [rangeStart, setRangeStart] = useState(todayISO());
  const [rangeEnd, setRangeEnd] = useState(nextMonthISO());
  const [daySelection, setDaySelection] = useState(makeInitialDays);
  const [routineStart, setRoutineStart] = useState("09:00");
  const [routineEnd, setRoutineEnd] = useState("11:00");
  const [selectedWorkerProfileId, setSelectedWorkerProfileId] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedDayKeys = useMemo(
    () => ROUTINE_DAYS.filter((d) => daySelection[d.key]).map((d) => d.key),
    [daySelection],
  );

  const routine = useMemo(
    () => ({
      rangeStart,
      rangeEnd,
      dayKeys: selectedDayKeys,
      startTime: routineStart,
      endTime: routineEnd,
    }),
    [rangeStart, rangeEnd, selectedDayKeys, routineStart, routineEnd],
  );

  const rankedWorkers = useMemo(() => {
    const tierOrder = { perfect: 0, partial: 1 };
    return [...workers]
      .map((w) => ({
        worker: w,
        level: getWorkerSupportRoutineMatchLevel(w, routine),
      }))
      .filter((x) => x.level === "perfect" || x.level === "partial")
      .sort((a, b) => {
        const d = tierOrder[a.level] - tierOrder[b.level];
        if (d !== 0) return d;
        return workerDisplayName(a.worker).localeCompare(
          workerDisplayName(b.worker),
        );
      });
  }, [workers, routine]);

  useEffect(() => {
    if (!selectedWorkerProfileId) return;
    const still = rankedWorkers.some(
      (x) => String(x.worker._id) === String(selectedWorkerProfileId),
    );
    if (!still) setSelectedWorkerProfileId("");
  }, [rankedWorkers, selectedWorkerProfileId]);

  function toggleDay(key) {
    setDaySelection((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!supportTitle.trim()) {
      setError("Support title is required.");
      return;
    }
    if (!selectedDayKeys.length) {
      setError("Select at least one day for the support routine.");
      return;
    }
    if (routineStart >= routineEnd) {
      setError("End time must be after start time.");
      return;
    }
    if (rangeEnd < rangeStart) {
      setError("End date must be on or after start date.");
      return;
    }
    if (!selectedWorkerProfileId) {
      setError("Select a support worker.");
      return;
    }
    const worker = workers.find(
      (w) => String(w._id) === String(selectedWorkerProfileId),
    );
    const workerUserId = worker?.userId?._id || worker?.userId;
    if (!workerUserId) {
      setError("Invalid worker selection.");
      return;
    }

    setSaving(true);
    try {
      const body = {
        participantId,
        workerUserId: workerUserId.toString(),
        careManagerUserId,
        startDate: new Date(`${rangeStart}T12:00:00`).toISOString(),
        endDate: new Date(`${rangeEnd}T12:00:00`).toISOString(),
        status: "active",
        supportTitle: supportTitle.trim(),
        supportDescription: supportDescription.trim() || undefined,
        routineDayKeys: selectedDayKeys,
        routineStartTime: routineStart,
        routineEndTime: routineEnd,
      };
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not save support setup.");
        return;
      }
      router.push(`/participants/${participantId}`);
      router.refresh();
    } catch {
      setError("Could not save support setup.");
    } finally {
      setSaving(false);
    }
  }

  const fullName =
    `${participant.firstName || ""} ${participant.lastName || ""}`.trim();
  const alerts = Array.isArray(participant.medicalAlerts)
    ? participant.medicalAlerts
    : [];
  const flags = Array.isArray(participant.highRiskFlags)
    ? participant.highRiskFlags
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/participants/${participantId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to profile
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Important information</CardTitle>
          <CardDescription>
            Key details for anyone delivering support for this participant.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Participant
              </p>
              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                {fullName || "—"}
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                NDIS {participant.ndisNumber || "—"} ·{" "}
                {participant.state || "—"}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Address & contact
              </p>
              <p className="text-zinc-800 dark:text-zinc-200">
                {participant.address || "—"}
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                {participant.phone || "No phone on file"}
              </p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-3 dark:border-amber-900/50 dark:bg-amber-950/20">
              <p className="text-xs font-medium uppercase tracking-wide text-amber-800 dark:text-amber-200">
                Medical alerts
              </p>
              {alerts.length ? (
                <ul className="mt-1 list-disc pl-4 text-zinc-800 dark:text-zinc-200">
                  {alerts.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                  None recorded.
                </p>
              )}
            </div>
            <div className="rounded-xl border border-red-200/80 bg-red-50/40 p-3 dark:border-red-900/40 dark:bg-red-950/20">
              <p className="text-xs font-medium uppercase tracking-wide text-red-800 dark:text-red-200">
                High risk flags
              </p>
              {flags.length ? (
                <ul className="mt-1 list-disc pl-4 text-zinc-800 dark:text-zinc-200">
                  {flags.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                  None recorded.
                </p>
              )}
            </div>
          </div>
          {participant.primaryDisability ? (
            <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Primary disability
              </p>
              <p className="text-zinc-800 dark:text-zinc-200">
                {participant.primaryDisability}
              </p>
            </div>
          ) : null}
          {participant.epilepsyProtocol ? (
            <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Epilepsy protocol
              </p>
              <p className="text-zinc-800 dark:text-zinc-200">
                {participant.epilepsyProtocol}
              </p>
            </div>
          ) : null}
          {participant.emergencyContact?.name ||
          participant.emergencyContact?.phone ? (
            <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Emergency contact
              </p>
              <p className="text-zinc-800 dark:text-zinc-200">
                {participant.emergencyContact?.name || "—"}
                {participant.emergencyContact?.relationship
                  ? ` (${participant.emergencyContact.relationship})`
                  : ""}
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                {participant.emergencyContact?.phone || "—"}
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Support routine</CardTitle>
            <CardDescription>
              Title and schedule for this support. Workers are matched when
              their saved availability fully covers these times on each selected
              day.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Support title
              </label>
              <Input
                value={supportTitle}
                onChange={(e) => setSupportTitle(e.target.value)}
                placeholder="e.g. Weekday community access"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Support description
              </label>
              <textarea
                className={cn(
                  "min-h-[88px] w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm transition placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder:text-zinc-400",
                )}
                value={supportDescription}
                onChange={(e) => setSupportDescription(e.target.value)}
                placeholder="Goals, preferences, or session notes for the worker."
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  Start date
                </label>
                <Input
                  type="date"
                  value={rangeStart}
                  onChange={(e) => setRangeStart(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  End date
                </label>
                <Input
                  type="date"
                  value={rangeEnd}
                  onChange={(e) => setRangeEnd(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Days
              </p>
              <div className="flex flex-wrap gap-2">
                {ROUTINE_DAYS.map((day) => (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => toggleDay(day.key)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition",
                      daySelection[day.key]
                        ? "border-violet-600 bg-violet-600 text-white"
                        : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200",
                    )}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  Start time
                </label>
                <Input
                  type="time"
                  value={routineStart}
                  onChange={(e) => setRoutineStart(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  End time
                </label>
                <Input
                  type="time"
                  value={routineEnd}
                  onChange={(e) => setRoutineEnd(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Assign support worker</CardTitle>
            <CardDescription>
              Only workers whose availability matches this routine are listed.
              Select a card to assign; select it again to clear your choice.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {workers.length === 0 ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No support workers in this company yet.
              </p>
            ) : rankedWorkers.length === 0 ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No workers match this routine yet. Adjust dates, days, or times,
                or ask workers to update their availability under Schedule →
                Availability.
              </p>
            ) : (
              <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {rankedWorkers.map(({ worker: w, level }) => {
                  const uid = String(w._id);
                  const name = workerDisplayName(w);
                  const selected = selectedWorkerProfileId === uid;
                  return (
                    <li key={uid} className="list-none">
                      <button
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() =>
                          setSelectedWorkerProfileId((prev) =>
                            prev === uid ? "" : uid,
                          )
                        }
                        className={cn(
                          "flex w-full flex-col items-center gap-2 rounded-2xl border p-3 text-center transition outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                          selected
                            ? "border-emerald-600 bg-emerald-50 shadow-sm ring-2 ring-emerald-400/45 focus-visible:ring-emerald-500 dark:border-emerald-500 dark:bg-emerald-950/40 dark:ring-emerald-500/35"
                            : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/80 focus-visible:ring-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/40 dark:focus-visible:ring-zinc-600",
                        )}
                      >
                        <div className="relative mx-auto">
                          <WorkerCircleAvatar worker={w} selected={selected} />
                          {selected ? (
                            <span
                              className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-emerald-600 shadow-sm dark:border-zinc-900"
                              aria-hidden
                            >
                              <Check
                                className="h-3.5 w-3.5 text-white"
                                strokeWidth={3}
                              />
                            </span>
                          ) : null}
                        </div>
                        <span className="group/av relative w-full cursor-help">
                          <span className="line-clamp-2 w-full text-xs font-medium text-zinc-900 dark:text-zinc-50">
                            {name}
                          </span>
                          <span
                            role="tooltip"
                            className={cn(
                              "pointer-events-none absolute left-1/2 top-full z-[60] mt-1.5 w-[min(280px,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border px-2.5 py-2 text-left text-[11px] leading-snug shadow-xl",
                              "invisible border-zinc-700 bg-zinc-950 text-zinc-100 opacity-0 transition-[opacity,visibility] duration-150",
                              "group-hover/av:visible group-hover/av:opacity-100",
                            )}
                          >
                            <span className="block whitespace-pre-line">
                              {formatWorkerAvailabilityTooltip(w)}
                            </span>
                          </span>
                        </span>
                        {level === "perfect" ? (
                          <span className="text-[10px] font-semibold leading-tight text-emerald-600 dark:text-emerald-400">
                            Perfect Match
                          </span>
                        ) : null}
                        {level === "partial" ? (
                          <span className="text-[10px] font-semibold leading-tight text-orange-600 dark:text-orange-400">
                            Partial Date/Time match
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Create Support Session"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href={`/participants/${participantId}`}>Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}

function workerDisplayName(worker) {
  const u = worker?.userId;
  const n =
    `${u?.firstName || ""} ${u?.lastName || ""}`.trim() || u?.email || "Worker";
  return n;
}

function availabilityStatusLabel(status) {
  switch (status) {
    case "available":
      return "Available";
    case "limited":
      return "Limited";
    case "unavailable":
      return "Unavailable";
    case "on_leave":
      return "On leave";
    default:
      return status ? String(status).replaceAll("_", " ") : "—";
  }
}

function formatWorkerAvailabilityTooltip(worker) {
  const sched = worker?.availabilitySchedule;
  const lines = [];
  lines.push(
    `Availability status: ${availabilityStatusLabel(worker?.availabilityStatus)}`,
  );

  if (!sched || typeof sched !== "object" || !sched.days) {
    lines.push("No weekly schedule saved yet.");
    return lines.join("\n");
  }

  const mode =
    sched.repeatMode === "date-range" ? "Date range" : "Weekly pattern";
  if (sched.rangeStart && sched.rangeEnd) {
    lines.push(`${mode}: ${sched.rangeStart} → ${sched.rangeEnd}`);
  } else {
    lines.push(mode);
  }

  const hasDay = ROUTINE_DAYS.some(({ key }) => sched.days[key]?.enabled);
  if (!hasDay) {
    lines.push("No days marked available.");
    return lines.join("\n");
  }

  lines.push("Open hours:");
  for (const { key, label } of ROUTINE_DAYS) {
    const d = sched.days[key];
    if (!d?.enabled) continue;
    const start = typeof d.start === "string" ? d.start : "—";
    const end = typeof d.end === "string" ? d.end : "—";
    lines.push(`• ${label}: ${start} – ${end}`);
  }

  return lines.join("\n");
}

function initialsFromUser(u) {
  if (!u) return "?";
  const f = u.firstName?.trim?.()?.[0] || "";
  const l = u.lastName?.trim?.()?.[0] || "";
  const pair = `${f}${l}`.toUpperCase();
  if (pair) return pair;
  const e = u.email?.trim?.()?.[0];
  return e ? e.toUpperCase() : "?";
}

function WorkerCircleAvatar({ worker, selected }) {
  const user = worker?.userId;
  const initials = initialsFromUser(user);
  const photoUrl =
    typeof worker?.profilePhotoUrl === "string" && worker.profilePhotoUrl
      ? worker.profilePhotoUrl
      : null;

  return (
    <div
      className={cn(
        "flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 bg-gradient-to-br from-violet-400 via-indigo-500 to-sky-500 text-sm font-bold text-white shadow-inner transition",
        selected
          ? "border-emerald-500 ring-2 ring-emerald-400/70 dark:border-emerald-400"
          : "border-white/40",
      )}
    >
      {photoUrl ? (
        <img src={photoUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="select-none">{initials}</span>
      )}
    </div>
  );
}
