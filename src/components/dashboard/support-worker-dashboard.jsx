"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  Clock3,
  MapPin,
  UserRound,
  UsersRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  computeEarliestRoutineShift,
  computeEarliestScheduledShift,
  computeNextShiftOccurrence,
  pickEarlierShift,
} from "@/lib/supportRoutine";

const CLOCK_WINDOW_MS = 5 * 60 * 1000;

function formatRange(start, end) {
  const opts = { weekday: "short", month: "short", day: "numeric" };
  const tOpts = { hour: "numeric", minute: "2-digit" };
  return `${start.toLocaleDateString(undefined, opts)} · ${start.toLocaleTimeString(undefined, tOpts)} – ${end.toLocaleTimeString(undefined, tOpts)}`;
}

function formatVisitHint(start) {
  const opts = { weekday: "short", month: "short", day: "numeric" };
  const tOpts = { hour: "numeric", minute: "2-digit" };
  return `${start.toLocaleDateString(undefined, opts)} · ${start.toLocaleTimeString(undefined, tOpts)}`;
}

function inWindow(now, center, windowMs = CLOCK_WINDOW_MS) {
  const t = now.getTime();
  const c = center.getTime();
  return t >= c - windowMs && t <= c + windowMs;
}

function participantDisplayName(p) {
  if (!p || typeof p !== "object") return "Participant";
  const n = `${p.firstName || ""} ${p.lastName || ""}`.trim();
  return n || "Participant";
}

export function SupportWorkerDashboard({ user, dashboard }) {
  const assignments = dashboard?.assignments ?? [];
  const upcomingShifts = dashboard?.upcomingShifts ?? [];

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

  const [tick, setTick] = useState(0);
  const [atServiceLocation, setAtServiceLocation] = useState(false);
  const [clockedInAt, setClockedInAt] = useState(null);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 15_000);
    return () => clearInterval(id);
  }, []);

  const now = useMemo(() => new Date(), [tick]);

  const nextShift = useMemo(() => {
    const fromRoutine = computeEarliestRoutineShift(now, assignments);
    const fromRoster = computeEarliestScheduledShift(now, upcomingShifts);
    return pickEarlierShift(fromRoutine, fromRoster);
  }, [assignments, upcomingShifts, now]);

  const nextParticipant = nextShift?.participantId;
  const nextParticipantName = participantDisplayName(nextParticipant);
  const nextAddress =
    typeof nextParticipant === "object" && nextParticipant?.address
      ? nextParticipant.address
      : null;
  const serviceLabel = nextShift?.supportTitle || "Scheduled support";

  const canClockIn =
    Boolean(nextShift) &&
    !clockedInAt &&
    inWindow(now, nextShift.start) &&
    atServiceLocation;
  const canClockOut =
    Boolean(nextShift) &&
    Boolean(clockedInAt) &&
    inWindow(now, nextShift.end) &&
    atServiceLocation;

  let clockInHint =
    "You are in the clock-in window and marked on-site.";
  if (!nextShift) {
    clockInHint = "No upcoming shift found — clock-in is disabled.";
  } else if (clockedInAt) {
    clockInHint = `Shift started at ${clockedInAt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}.`;
  } else if (!atServiceLocation) {
    clockInHint =
      "Confirm you are at the participant’s service location to enable clock-in.";
  } else if (!inWindow(now, nextShift.start)) {
    clockInHint = `Clock-in is only available within ±5 minutes of the scheduled start (${nextShift.start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}).`;
  }

  let clockOutHint = "You are in the clock-out window.";
  if (!nextShift) {
    clockOutHint = "No upcoming shift.";
  } else if (!clockedInAt) {
    clockOutHint = "Clock in first to end your shift.";
  } else if (!atServiceLocation) {
    clockOutHint =
      "Confirm you are still at the participant’s location to clock out.";
  } else if (!inWindow(now, nextShift.end)) {
    clockOutHint = `Clock-out is only available within ±5 minutes of the scheduled end (${nextShift.end.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}).`;
  }

  const handleClockIn = useCallback(() => {
    if (canClockIn) setClockedInAt(new Date());
  }, [canClockIn]);

  const handleClockOut = useCallback(() => {
    if (canClockOut) setClockedInAt(null);
  }, [canClockOut]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">
          Your dashboard
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Welcome back, {displayName}. Here are your assigned participants and
          your next shift.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2 text-lg">
              <UsersRound className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              Assigned participants
            </CardTitle>
            <CardDescription>
              Participants currently assigned to you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {assignments.length === 0 ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                You do not have any active participant assignments yet.
              </p>
            ) : (
              assignments.map((a) => {
                const p = a.participantId;
                const name = participantDisplayName(p);
                const occ = computeNextShiftOccurrence(now, a);
                const nextVisit = occ
                  ? formatVisitHint(occ.start)
                  : "No upcoming routine in range";
                return (
                  <div
                    key={a._id}
                    className="flex flex-col gap-1 rounded-xl border border-zinc-200/90 p-3 dark:border-zinc-800"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-2 font-medium text-zinc-900 dark:text-zinc-50">
                        <UserRound className="h-4 w-4 text-zinc-500" />
                        {name}
                      </span>
                      <Badge variant="secondary" className="shrink-0 text-[10px]">
                        Active
                      </Badge>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      {a.supportTitle || "Support assignment"}
                    </p>
                    {p?.ndisNumber ? (
                      <p className="text-xs text-zinc-500">
                        NDIS {p.ndisNumber}
                      </p>
                    ) : null}
                    {p?.primaryDisability ? (
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        {p.primaryDisability}
                      </p>
                    ) : null}
                    {(Array.isArray(p?.medicalAlerts) &&
                      p.medicalAlerts.length > 0) ||
                    (Array.isArray(p?.highRiskFlags) &&
                      p.highRiskFlags.length > 0) ? (
                      <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
                        Alerts on file — open profile for full clinical detail.
                      </p>
                    ) : null}
                    <p className="text-xs font-medium text-violet-700 dark:text-violet-300">
                      Next shift: {nextVisit}
                    </p>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2 text-lg">
              <CalendarClock className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              Next shift
            </CardTitle>
            <CardDescription>
              Earliest upcoming rostered or routine shift from now.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {!nextShift ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No upcoming shifts in your schedule. Support routines appear here
                once a coordinator completes setup.
              </p>
            ) : (
              <div className="rounded-xl border border-zinc-200/90 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
                <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {nextParticipantName}
                </p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  {serviceLabel}
                </p>
                {nextAddress ? (
                  <p className="mt-2 inline-flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-500" />
                    {nextAddress}
                  </p>
                ) : null}
                <p className="mt-2 text-xs font-medium text-zinc-800 dark:text-zinc-200">
                  {formatRange(nextShift.start, nextShift.end)}
                </p>
              </div>
            )}
            <Button variant="secondary" size="sm" className="w-full" asChild>
              <Link href="/schedule">View full schedule</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2 text-lg">
            <Clock3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Clock in / Clock out
          </CardTitle>
          <CardDescription>
            You can clock in or out only within ±5 minutes of the scheduled
            start or end time, and only while you confirm you are at the
            participant’s service location. (UI rules only — times use your
            device clock.)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-200/90 p-3 dark:border-zinc-800">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-zinc-300"
              checked={atServiceLocation}
              onChange={(e) => setAtServiceLocation(e.target.checked)}
            />
            <span className="text-sm text-zinc-700 dark:text-zinc-300">
              I confirm I am at the participant’s service address for this shift
              (stand-in for GPS / geofence until location services are
              connected).
            </span>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 rounded-xl border border-zinc-200/90 p-3 dark:border-zinc-800">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Clock in
              </p>
              <Button
                className="w-full"
                disabled={!canClockIn}
                onClick={handleClockIn}
              >
                Clock in
              </Button>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                {clockInHint}
              </p>
            </div>
            <div className="space-y-2 rounded-xl border border-zinc-200/90 p-3 dark:border-zinc-800">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Clock out
              </p>
              <Button
                variant="secondary"
                className="w-full"
                disabled={!canClockOut}
                onClick={handleClockOut}
              >
                Clock out
              </Button>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                {clockOutHint}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
