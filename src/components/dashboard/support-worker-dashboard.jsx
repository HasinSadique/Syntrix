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

const CLOCK_WINDOW_MS = 5 * 60 * 1000;

/** Demo shift: next block today that has not ended (+5), else tomorrow 9–11. */
function getMockNextShift(now = new Date()) {
  const dayShifts = [
    {
      participantName: "Alex Morgan",
      serviceLine: "Personal care",
      address: "12 River St, Parramatta NSW 2150",
      startH: 9,
      startM: 0,
      endH: 11,
      endM: 0,
    },
    {
      participantName: "Jordan Lee",
      serviceLine: "Community access",
      address: "88 George St, Sydney NSW 2000",
      startH: 14,
      startM: 0,
      endH: 16,
      endM: 0,
    },
  ];

  for (const s of dayShifts) {
    const start = new Date(now);
    start.setHours(s.startH, s.startM, 0, 0);
    const end = new Date(now);
    end.setHours(s.endH, s.endM, 0, 0);
    if (now.getTime() <= end.getTime() + CLOCK_WINDOW_MS) {
      return {
        participantName: s.participantName,
        serviceLine: s.serviceLine,
        address: s.address,
        start,
        end,
      };
    }
  }

  const start = new Date(now);
  start.setDate(start.getDate() + 1);
  start.setHours(9, 0, 0, 0);
  const end = new Date(start);
  end.setHours(11, 0, 0, 0);
  return {
    participantName: "Alex Morgan",
    serviceLine: "Personal care",
    address: "12 River St, Parramatta NSW 2150",
    start,
    end,
  };
}

const MOCK_ASSIGNED = [
  {
    id: "1",
    name: "Alex Morgan",
    plan: "Core — Daily living",
    nextVisit: "Today · 2:00 PM",
  },
  {
    id: "2",
    name: "Jordan Lee",
    plan: "Capacity building",
    nextVisit: "Tomorrow · 9:00 AM",
  },
  {
    id: "3",
    name: "Sam Rivera",
    plan: "Core — Social participation",
    nextVisit: "Wed · 4:30 PM",
  },
];

function formatRange(start, end) {
  const opts = { weekday: "short", month: "short", day: "numeric" };
  const tOpts = { hour: "numeric", minute: "2-digit" };
  return `${start.toLocaleDateString(undefined, opts)} · ${start.toLocaleTimeString(undefined, tOpts)} – ${end.toLocaleTimeString(undefined, tOpts)}`;
}

function inWindow(now, center, windowMs = CLOCK_WINDOW_MS) {
  const t = now.getTime();
  const c = center.getTime();
  return t >= c - windowMs && t <= c + windowMs;
}

export function SupportWorkerDashboard({ user }) {
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

  const [tick, setTick] = useState(0);
  const [atServiceLocation, setAtServiceLocation] = useState(false);
  const [clockedInAt, setClockedInAt] = useState(null);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 15_000);
    return () => clearInterval(id);
  }, []);

  const nextShift = useMemo(() => getMockNextShift(new Date()), [tick]);

  const now = new Date();
  const canClockIn =
    !clockedInAt &&
    inWindow(now, nextShift.start) &&
    atServiceLocation;
  const canClockOut =
    Boolean(clockedInAt) &&
    inWindow(now, nextShift.end) &&
    atServiceLocation;

  let clockInHint = "You are in the clock-in window and marked on-site.";
  if (clockedInAt) {
    clockInHint = `Shift started at ${clockedInAt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}.`;
  } else if (!atServiceLocation) {
    clockInHint =
      "Confirm you are at the participant’s service location to enable clock-in.";
  } else if (!inWindow(now, nextShift.start)) {
    clockInHint = `Clock-in is only available within ±5 minutes of the scheduled start (${nextShift.start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}).`;
  }

  let clockOutHint = "You are in the clock-out window.";
  if (!clockedInAt) {
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
        <h2 className="text-2xl font-semibold tracking-tight">Your dashboard</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Welcome back, {displayName}. Here are your participants, next shift, and shift
          clock-in tools (demo data until roster is connected).
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2 text-lg">
              <UsersRound className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              Assigned participants
            </CardTitle>
            <CardDescription>Participants currently assigned to you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_ASSIGNED.map((p) => (
              <div
                key={p.id}
                className="flex flex-col gap-1 rounded-xl border border-zinc-200/90 p-3 dark:border-zinc-800"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2 font-medium text-zinc-900 dark:text-zinc-50">
                    <UserRound className="h-4 w-4 text-zinc-500" />
                    {p.name}
                  </span>
                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                    Active
                  </Badge>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">{p.plan}</p>
                <p className="text-xs font-medium text-violet-700 dark:text-violet-300">
                  Next visit: {p.nextVisit}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2 text-lg">
              <CalendarClock className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              Next shift
            </CardTitle>
            <CardDescription>Upcoming rostered service (sample schedule).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-xl border border-zinc-200/90 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                {nextShift.participantName}
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">{nextShift.serviceLine}</p>
              <p className="mt-2 inline-flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-500" />
                {nextShift.address}
              </p>
              <p className="mt-2 text-xs font-medium text-zinc-800 dark:text-zinc-200">
                {formatRange(nextShift.start, nextShift.end)}
              </p>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Shifts and addresses will sync from rostering once that module is live.
            </p>
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
            You can clock in or out only within ±5 minutes of the scheduled start or end time,
            and only while you confirm you are at the participant’s service location. (UI
            rules only — times use your device clock.)
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
              I confirm I am at the participant’s service address for this shift (stand-in
              for GPS / geofence until location services are connected).
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
              <p className="text-xs text-zinc-600 dark:text-zinc-400">{clockInHint}</p>
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
              <p className="text-xs text-zinc-600 dark:text-zinc-400">{clockOutHint}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
