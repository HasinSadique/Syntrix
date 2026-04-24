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

export function SupportWorkerSchedule({ user }) {
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

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
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300/90 bg-zinc-50/50 py-14 text-center dark:border-zinc-700 dark:bg-zinc-900/30">
            <CalendarClock className="h-10 w-10 text-zinc-300 dark:text-zinc-600" />
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              No upcoming shifts
            </p>
            <p className="max-w-sm text-xs text-zinc-500 dark:text-zinc-400">
              When rostering is connected, your next shifts will show in this section.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
