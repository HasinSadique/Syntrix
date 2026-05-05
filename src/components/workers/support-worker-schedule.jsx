"use client";

import Link from "next/link";
import { CalendarClock, CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  computeEarliestScheduledShift,
  computeNextShiftOccurrence,
} from "@/lib/supportRoutine";

function formatDate(value) {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function participantName(participant) {
  return (
    `${participant?.firstName || ""} ${participant?.lastName || ""}`.trim() ||
    "Participant"
  );
}

function formatTime(value) {
  if (!value) return "—";
  const [h, m] = String(value).split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return String(value);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" });
}

export function SupportWorkerSchedule({
  user,
  upcomingShifts = [],
  activeAssignments = [],
}) {
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
  const now = new Date();

  const scheduled = upcomingShifts.map((shift) => {
    const date = new Date(shift.shiftDate);
    const [sh, sm] = String(shift.startTime || "00:00").split(":").map(Number);
    const start = new Date(date);
    start.setHours(sh, sm, 0, 0);
    return {
      key: `shift-${shift._id}`,
      supportTitle: shift.serviceType || "Support shift",
      participantName: participantName(shift.participantId),
      dateLabel: formatDate(shift.shiftDate),
      timeLabel: `${formatTime(shift.startTime)} - ${formatTime(shift.endTime)}`,
      startAt: start.getTime(),
      source: "Shift",
    };
  });

  const routine = activeAssignments
    .map((assignment) => {
      const occ = computeNextShiftOccurrence(now, assignment);
      if (!occ) return null;
      return {
        key: `assignment-${assignment._id}`,
        supportTitle: assignment.supportTitle || "Support assignment",
        participantName: participantName(assignment.participantId),
        dateLabel: formatDate(occ.start),
        timeLabel: `${formatTime(assignment.routineStartTime)} - ${formatTime(assignment.routineEndTime)}`,
        startAt: occ.start.getTime(),
        source: "Routine",
      };
    })
    .filter(Boolean);

  const upcomingCards = [...scheduled, ...routine]
    .sort((a, b) => a.startAt - b.startAt)
    .slice(0, 24);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Your schedule</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {name}, manage when you are available and see shifts assigned to you.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200/90 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
        <Button className="w-full sm:w-auto" asChild>
          <Link href="/schedule/availability">Set my availability</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2 text-lg">
            <CalendarRange className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            Upcoming shifts
          </CardTitle>
          <CardDescription>
            Rostered services assigned to you will be listed here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingCards.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300/90 bg-zinc-50/50 py-14 text-center dark:border-zinc-700 dark:bg-zinc-900/30">
              <CalendarClock className="h-10 w-10 text-zinc-300 dark:text-zinc-600" />
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                No upcoming shifts, your next assigned shifts will be displayed here.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingCards.map((item) => {
                return (
                  <div
                    key={item.key}
                    className="rounded-xl border border-zinc-200/90 p-3 dark:border-zinc-800"
                  >
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {item.supportTitle}
                    </p>
                    <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                      {item.dateLabel}
                    </p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      {item.timeLabel}
                    </p>
                    <p className="mt-2 text-xs font-medium text-zinc-800 dark:text-zinc-200">
                      {item.participantName}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      {item.source}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
