"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarRange, Pencil, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const WEEK_DAYS = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

function makeInitialDays() {
  return WEEK_DAYS.reduce((acc, day) => {
    acc[day.key] = { enabled: false, start: "09:00", end: "17:00" };
    return acc;
  }, {});
}

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

function getAvailabilityDurationLabel(start, end) {
  if (!start || !end || end <= start) {
    return "0 hours 0 minutes available";
  }
  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);
  const totalStartMinutes = startH * 60 + startM;
  const totalEndMinutes = endH * 60 + endM;
  const diffMinutes = Math.max(totalEndMinutes - totalStartMinutes, 0);
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  return `${hours} hours ${minutes} minutes available`;
}

function getDefaultAvailability() {
  return {
    repeatMode: "weekly",
    rangeStart: todayISO(),
    rangeEnd: nextMonthISO(),
    savedAt: null,
    days: makeInitialDays(),
  };
}

function normalizeAvailability(input) {
  const fallback = getDefaultAvailability();
  if (!input || typeof input !== "object") {
    return fallback;
  }

  const days = makeInitialDays();
  for (const day of WEEK_DAYS) {
    const dayValue = input?.days?.[day.key];
    if (!dayValue || typeof dayValue !== "object") continue;
    days[day.key] = {
      enabled: Boolean(dayValue.enabled),
      start: typeof dayValue.start === "string" ? dayValue.start : "09:00",
      end: typeof dayValue.end === "string" ? dayValue.end : "17:00",
    };
  }

  return {
    repeatMode:
      input.repeatMode === "date-range" ? "date-range" : fallback.repeatMode,
    rangeStart:
      typeof input.rangeStart === "string" ? input.rangeStart : fallback.rangeStart,
    rangeEnd: typeof input.rangeEnd === "string" ? input.rangeEnd : fallback.rangeEnd,
    savedAt: typeof input.savedAt === "string" ? input.savedAt : null,
    days,
  };
}

export function SupportWorkerAvailability({ user }) {
  const router = useRouter();
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
  const existingAvailability = user.workerProfile?.availabilitySchedule || null;
  const initialAvailability = useMemo(
    () => normalizeAvailability(existingAvailability),
    [existingAvailability],
  );

  const [days, setDays] = useState(initialAvailability.days);
  const [repeatMode, setRepeatMode] = useState(initialAvailability.repeatMode);
  const [rangeStart, setRangeStart] = useState(initialAvailability.rangeStart);
  const [rangeEnd, setRangeEnd] = useState(initialAvailability.rangeEnd);
  const [savedAt, setSavedAt] = useState(initialAvailability.savedAt);
  const [isSaved, setIsSaved] = useState(Boolean(existingAvailability));
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    setDays(initialAvailability.days);
    setRepeatMode(initialAvailability.repeatMode);
    setRangeStart(initialAvailability.rangeStart);
    setRangeEnd(initialAvailability.rangeEnd);
    setSavedAt(initialAvailability.savedAt);
    setIsSaved(Boolean(existingAvailability));
    setIsEditing(false);
  }, [existingAvailability, initialAvailability]);

  const hasAtLeastOneDay = useMemo(
    () => Object.values(days).some((d) => d.enabled),
    [days],
  );

  function updateDay(dayKey, patch) {
    setDays((prev) => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], ...patch },
    }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setValidationError("");
    setSaveError("");

    if (!hasAtLeastOneDay) {
      setValidationError("Select at least one day and set a time range.");
      return;
    }

    for (const day of WEEK_DAYS) {
      const slot = days[day.key];
      if (!slot.enabled) continue;
      if (!slot.start || !slot.end || slot.start >= slot.end) {
        setValidationError(`Set a valid start and end time for ${day.label}.`);
        return;
      }
    }

    if (repeatMode === "date-range" && rangeEnd < rangeStart) {
      setValidationError("End date must be on or after start date.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        repeatMode,
        rangeStart,
        rangeEnd,
        savedAt: todayISO(),
        days,
      };
      const response = await fetch("/api/users/me/availability", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        setSaveError(data.error || "Could not save availability.");
        return;
      }

      setIsSaved(Boolean(data?.availabilitySchedule));
      setSavedAt(data?.availabilitySchedule?.savedAt || todayISO());
      setIsEditing(false);
      router.refresh();
    } catch {
      setSaveError("Could not save availability right now.");
    } finally {
      setIsSaving(false);
    }
  }

  function getRepeatLabel() {
    if (repeatMode === "weekly") return "Repeats weekly";
    return `Repeats from ${rangeStart} to ${rangeEnd}`;
  }

  function getSavedRangeLabel() {
    if (repeatMode === "weekly") {
      return `Start date: ${savedAt || "Not set"}`;
    }
    return `Start date: ${rangeStart} | End date: ${rangeEnd}`;
  }

  const enabledDays = useMemo(
    () => WEEK_DAYS.filter((day) => days[day.key].enabled),
    [days],
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Button variant="ghost" size="sm" className="-ml-2 w-fit gap-1" asChild>
          <Link href="/schedule">
            <ArrowLeft className="h-4 w-4" />
            Back to schedule
          </Link>
        </Button>
        <h2 className="text-2xl font-semibold tracking-tight">
          Set my availability
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {name}, select your available days and the time range for each day.
          This form controls when you are available for shifts.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2 text-lg">
            <CalendarRange className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            Availability
          </CardTitle>
          <CardDescription>
            View your current availability or set it up if it has not been
            saved yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isSaved && !isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="w-full rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-100/70 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:hover:border-emerald-800"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                    Current availability
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    {getRepeatLabel()}
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    {getSavedRangeLabel()}
                  </p>
                  <ul className="space-y-1 text-sm text-emerald-800 dark:text-emerald-300">
                    {enabledDays.map((day) => (
                      <li key={`saved-${day.key}`}>
                        {day.label}: {days[day.key].start} - {days[day.key].end}
                      </li>
                    ))}
                  </ul>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-800 dark:text-emerald-300">
                  <Pencil className="h-3.5 w-3.5" />
                  Click to edit
                </span>
              </div>
            </button>
          ) : null}

          {!isSaved && !isEditing ? (
            <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-5 dark:border-zinc-700 dark:bg-zinc-900/40">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                No availability set
              </p>
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                Set up your availability to tell the system which days and times
                you can take shifts.
              </p>
              <Button
                type="button"
                className="mt-3"
                onClick={() => setIsEditing(true)}
              >
                Setup availability
              </Button>
            </div>
          ) : null}

          {isEditing ? (
            <form className="space-y-5" onSubmit={onSubmit}>
            <div className="space-y-3 rounded-xl border border-zinc-200/90 bg-zinc-50/90 p-4 dark:border-zinc-700 dark:bg-zinc-900/70">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Select available days and times
              </p>
              <div className="space-y-2">
                {WEEK_DAYS.map((day) => {
                  const slot = days[day.key];
                  return (
                    <div
                      key={day.key}
                      className="grid gap-2 rounded-lg border border-zinc-200/90 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-950/70 sm:grid-cols-[1fr_auto_auto]"
                    >
                      <div className="space-y-1">
                        <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-zinc-400"
                            checked={slot.enabled}
                            disabled={!isEditing}
                            onChange={(e) =>
                              updateDay(day.key, { enabled: e.target.checked })
                            }
                          />
                          {day.label}
                        </label>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">
                          {slot.enabled
                            ? getAvailabilityDurationLabel(slot.start, slot.end)
                            : "Not available"}
                        </p>
                      </div>
                      <label className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                        <span>Start</span>
                        <input
                          type="time"
                          value={slot.start}
                          disabled={!isEditing || !slot.enabled}
                          onChange={(e) =>
                            updateDay(day.key, { start: e.target.value })
                          }
                          className="h-9 w-full rounded-lg border border-zinc-300 bg-white px-2 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
                        />
                      </label>
                      <label className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                        <span>End</span>
                        <input
                          type="time"
                          value={slot.end}
                          disabled={!isEditing || !slot.enabled}
                          onChange={(e) =>
                            updateDay(day.key, { end: e.target.value })
                          }
                          className="h-9 w-full rounded-lg border border-zinc-300 bg-white px-2 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
                        />
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-zinc-200/90 p-4 dark:border-zinc-700">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Repeat options
              </p>
              <label className="block space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
                <span>Repeat type</span>
                <select
                  className="h-9 w-full rounded-lg border border-zinc-300 bg-white px-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
                  value={repeatMode}
                  disabled={!isEditing}
                  onChange={(e) => setRepeatMode(e.target.value)}
                >
                  <option value="weekly">Repeat every week</option>
                  <option value="date-range">Repeat for date range</option>
                </select>
              </label>

              {repeatMode === "date-range" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
                    <span>From date</span>
                    <input
                      type="date"
                      value={rangeStart}
                      disabled={!isEditing}
                      onChange={(e) => setRangeStart(e.target.value)}
                      className="h-9 w-full rounded-lg border border-zinc-300 bg-white px-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
                    />
                  </label>
                  <label className="block space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
                    <span>To date</span>
                    <input
                      type="date"
                      value={rangeEnd}
                      disabled={!isEditing}
                      onChange={(e) => setRangeEnd(e.target.value)}
                      className="h-9 w-full rounded-lg border border-zinc-300 bg-white px-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
                    />
                  </label>
                </div>
              ) : null}
            </div>

            {validationError ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                {validationError}
              </p>
            ) : null}
            {saveError ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                {saveError}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" className="gap-2" disabled={isSaving}>
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save availability"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="gap-2"
                onClick={() => setIsEditing(false)}
              >
                <Pencil className="h-4 w-4" />
                Cancel
              </Button>
            </div>
            </form>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
