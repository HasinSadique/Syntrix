"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarRange, Trash2 } from "lucide-react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { addWeeks, format, getDay, startOfWeek } from "date-fns";
import { enAU } from "date-fns/locale/en-AU";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const locales = { "en-AU": enAU };

const localizer = dateFnsLocalizer({
  format,
  startOfWeek,
  getDay,
  locales,
});

const REPEAT_WEEK_OPTIONS = [4, 8, 12, 26];

const CALENDAR_HEIGHT = "min(78vh, 720px)";

function makeDemoAvailability() {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  const a = new Date(base);
  a.setHours(9, 0, 0, 0);
  const b = new Date(base);
  b.setHours(12, 0, 0, 0);
  const c = new Date(base);
  c.setHours(13, 0, 0, 0);
  const d = new Date(base);
  d.setHours(17, 0, 0, 0);
  return [
    { id: "demo-1", title: "Available", start: a, end: b },
    { id: "demo-2", title: "Available", start: c, end: d },
  ];
}

/**
 * Single block, or the same day/time repeated weekly (seriesId links instances).
 */
function buildSlotsFromSelection(slotStart, slotEnd, repeatWeekly, weekCount) {
  const durationMs = slotEnd.getTime() - slotStart.getTime();
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    return [];
  }

  const idBase = `slot-${Date.now()}`;
  const start = new Date(slotStart);
  const end = new Date(slotEnd);

  if (!repeatWeekly) {
    return [{ id: idBase, title: "Available", start, end }];
  }

  const seriesId = idBase;
  const count = Math.min(Math.max(weekCount, 1), 52);
  const out = [];
  for (let i = 0; i < count; i += 1) {
    out.push({
      id: `${idBase}-w${i}`,
      seriesId,
      title: "Available (weekly)",
      start: addWeeks(new Date(start), i),
      end: addWeeks(new Date(end), i),
    });
  }
  return out;
}

export function SupportWorkerAvailability({ user }) {
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

  const [events, setEvents] = useState(makeDemoAvailability);
  const [view, setView] = useState(Views.WEEK);
  const [date, setDate] = useState(() => new Date());
  const [repeatWeekly, setRepeatWeekly] = useState(true);
  const [repeatWeeks, setRepeatWeeks] = useState(12);

  const shellRef = useRef(null);

  const { defaultDate, scrollToTime } = useMemo(() => {
    const d = new Date();
    d.setHours(7, 0, 0, 0);
    return { defaultDate: new Date(), scrollToTime: d };
  }, []);

  /** Auto-scroll the time grid while the user holds the mouse and drags near edges (slot select). */
  useEffect(() => {
    let armed = false;

    const onDown = (e) => {
      const root = shellRef.current;
      if (root?.contains(e.target)) {
        armed = true;
      }
    };

    const onUp = () => {
      armed = false;
    };

    const onMove = (e) => {
      if (!armed || e.buttons !== 1) return;
      const root = shellRef.current;
      if (!root) return;
      const scroller =
        root.querySelector(".rbc-time-content") ||
        root.querySelector(".rbc-day-slot");
      if (!scroller) return;
      const r = scroller.getBoundingClientRect();
      const zone = 80;
      if (e.clientY > r.bottom - zone) {
        scroller.scrollTop += 24;
      } else if (e.clientY < r.top + zone) {
        scroller.scrollTop = Math.max(0, scroller.scrollTop - 24);
      }
    };

    document.addEventListener("mousedown", onDown, true);
    document.addEventListener("mouseup", onUp, true);
    document.addEventListener("mouseleave", onUp, true);
    document.addEventListener("mousemove", onMove);
    return () => {
      document.removeEventListener("mousedown", onDown, true);
      document.removeEventListener("mouseup", onUp, true);
      document.removeEventListener("mouseleave", onUp, true);
      document.removeEventListener("mousemove", onMove);
    };
  }, []);

  const handleSelectSlot = useCallback(
    (slotInfo) => {
      const hours =
        (slotInfo.end.getTime() - slotInfo.start.getTime()) / (1000 * 60 * 60);
      const spansWholeOrMoreDays = hours >= 24;

      const newEvents = buildSlotsFromSelection(
        slotInfo.start,
        slotInfo.end,
        repeatWeekly && !spansWholeOrMoreDays,
        repeatWeeks,
      );
      if (newEvents.length === 0) return;

      setEvents((prev) => [...prev, ...newEvents]);
    },
    [repeatWeekly, repeatWeeks],
  );

  const handleRemove = useCallback((id) => {
    setEvents((prev) => {
      const victim = prev.find((e) => e.id === id);
      if (!victim) return prev;
      if (victim.seriesId) {
        return prev.filter((e) => e.seriesId !== victim.seriesId);
      }
      return prev.filter((e) => e.id !== id);
    });
  }, []);

  const eventPropGetter = useCallback((event) => ({
    className: event.seriesId
      ? "avail-rbc-event avail-rbc-event--series"
      : "avail-rbc-event avail-rbc-event--single",
  }), []);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Button variant="ghost" size="sm" className="-ml-2 w-fit gap-1" asChild>
          <Link href="/schedule">
            <ArrowLeft className="h-4 w-4" />
            Back to schedule
          </Link>
        </Button>
        <h2 className="text-2xl font-semibold tracking-tight">Set my availability</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {name}, drag on empty time in week or day view to add blocks. Turn on weekly repeat to
          copy the same window into future weeks. UI only — nothing is saved.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2 text-lg">
            <CalendarRange className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            Availability calendar
          </CardTitle>
          <CardDescription>
            Month, week, and day views. While dragging a new selection near the top or bottom of
            the time column, the grid scrolls so you can reach late hours.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 rounded-xl border border-zinc-200/90 bg-zinc-50/90 p-4 dark:border-zinc-700 dark:bg-zinc-900/70 sm:flex-row sm:flex-wrap sm:items-center">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-zinc-400"
                checked={repeatWeekly}
                onChange={(e) => setRepeatWeekly(e.target.checked)}
              />
              Repeat this selection every week
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <span className="whitespace-nowrap text-zinc-600 dark:text-zinc-400">for</span>
              <select
                className="h-9 rounded-lg border border-zinc-300 bg-white px-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
                value={repeatWeeks}
                disabled={!repeatWeekly}
                onChange={(e) => setRepeatWeeks(Number(e.target.value))}
              >
                {REPEAT_WEEK_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n} weeks
                  </option>
                ))}
              </select>
            </label>
            {!repeatWeekly ? (
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Off: only the dragged range is added once.
              </span>
            ) : (
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Removing one week of a recurring block deletes the whole series.
              </span>
            )}
          </div>

          <div
            ref={shellRef}
            className={cn(
              "availability-calendar-shell rounded-xl border border-zinc-200 bg-white text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100",
            )}
            style={{ height: CALENDAR_HEIGHT }}
          >
            <Calendar
              culture="en-AU"
              localizer={localizer}
              events={events}
              view={view}
              views={[Views.MONTH, Views.WEEK, Views.DAY]}
              date={date}
              onNavigate={setDate}
              onView={setView}
              defaultDate={defaultDate}
              scrollToTime={scrollToTime}
              selectable
              onSelectSlot={handleSelectSlot}
              startAccessor="start"
              endAccessor="end"
              titleAccessor="title"
              style={{ height: "100%" }}
              step={30}
              timeslots={2}
              eventPropGetter={eventPropGetter}
              messages={{
                week: "Week",
                work_week: "Work week",
                day: "Day",
                month: "Month",
                previous: "Back",
                next: "Next",
                today: "Today",
                agenda: "Agenda",
                showMore: (total) => `+${total} more`,
              }}
            />
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Time blocks (this session)
            </h3>
            {events.length === 0 ? (
              <p className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                No blocks yet — select a range on the calendar in week or day view.
              </p>
            ) : (
              <ul className="max-h-56 space-y-2 overflow-y-auto pr-1">
                {events.map((ev) => (
                  <li
                    key={ev.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200/90 bg-zinc-50/90 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900/50"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-zinc-900 dark:text-zinc-50">
                        {ev.title}
                        {ev.seriesId ? (
                          <span className="ml-2 text-xs font-normal text-cyan-700 dark:text-cyan-300">
                            (weekly series)
                          </span>
                        ) : null}
                      </p>
                      <p className="truncate text-xs text-zinc-600 dark:text-zinc-400">
                        {format(ev.start, "EEE d MMM yyyy, p", { locale: enAU })} —{" "}
                        {format(ev.end, "p", { locale: enAU })}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-zinc-500 hover:text-red-600"
                      onClick={() => handleRemove(ev.id)}
                      aria-label={
                        ev.seriesId ? "Remove entire weekly series" : "Remove block"
                      }
                      title={ev.seriesId ? "Remove entire weekly series" : "Remove block"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Roster integration will persist these windows and align them with employment rules
              from your profile.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
