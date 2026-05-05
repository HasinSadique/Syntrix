/** @typedef {{ key: string, label: string }} RoutineDay */

export const ROUTINE_DAY_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const ROUTINE_DAYS = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

const KEY_TO_DOW = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

function compareHm(a, b) {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

/** @param {object | undefined} d — day slot from availabilitySchedule.days */
function classifyDayAvailability(d, startTime, endTime) {
  if (!d?.enabled) return "none";
  const full =
    compareHm(d.start, startTime) <= 0 && compareHm(d.end, endTime) >= 0;
  if (full) return "full";
  const overlaps =
    compareHm(d.start, endTime) < 0 && compareHm(d.end, startTime) > 0;
  if (overlaps) return "overlap";
  return "none";
}

function routineDateRangeOverlapsWorker(sched, rangeStart, rangeEnd) {
  if (!sched?.rangeStart || !sched?.rangeEnd) return true;
  return !(sched.rangeEnd < rangeStart || sched.rangeStart > rangeEnd);
}

/**
 * Worker availability covers support slot when each selected day is enabled
 * and worker's window fully contains the support time range.
 */
export function workerMatchesSupportRoutine(worker, routine) {
  return getWorkerSupportRoutineMatchLevel(worker, routine) === "perfect";
}

/**
 * @returns {"unset" | "none" | "partial" | "perfect"}
 */
export function getWorkerSupportRoutineMatchLevel(worker, routine) {
  const { rangeStart, rangeEnd, dayKeys, startTime, endTime } = routine;
  if (!dayKeys?.length || !startTime || !endTime || startTime >= endTime) {
    return "unset";
  }
  if (!worker?.availabilitySchedule?.days) return "none";
  const status = worker.availabilityStatus;
  if (status === "unavailable" || status === "on_leave") return "none";

  const sched = worker.availabilitySchedule;
  if (!routineDateRangeOverlapsWorker(sched, rangeStart, rangeEnd)) {
    return "none";
  }

  let fullCount = 0;
  let anyOverlap = false;

  for (const dk of dayKeys) {
    const d = sched.days[dk];
    const cls = classifyDayAvailability(d, startTime, endTime);
    if (cls === "full") {
      fullCount++;
      anyOverlap = true;
    } else if (cls === "overlap") {
      anyOverlap = true;
    }
  }

  if (fullCount === dayKeys.length) return "perfect";
  if (anyOverlap) return "partial";
  return "none";
}

function dowKeyFromDate(d) {
  const dow = d.getDay();
  return Object.keys(KEY_TO_DOW).find((k) => KEY_TO_DOW[k] === dow);
}

/**
 * Next occurrence of this assignment's weekly routine within start/end bounds.
 * @param {Date} now
 * @param {object} assignment — lean doc with routine fields + participantId populated optional
 */
export function computeNextShiftOccurrence(now, assignment) {
  if (
    !assignment?.routineDayKeys?.length ||
    !assignment.routineStartTime ||
    !assignment.routineEndTime
  ) {
    return null;
  }

  const startBound = new Date(assignment.startDate);
  const endBound = new Date(assignment.endDate);
  endBound.setHours(23, 59, 59, 999);

  const [sh, sm] = assignment.routineStartTime.split(":").map(Number);
  const [eh, em] = assignment.routineEndTime.split(":").map(Number);

  const startSearch = Math.max(now.getTime(), startBound.getTime());
  let dayCursor = new Date(startSearch);
  dayCursor.setHours(0, 0, 0, 0);

  if (dayCursor.getTime() < startBound.getTime()) {
    dayCursor = new Date(startBound);
    dayCursor.setHours(0, 0, 0, 0);
  }

  for (let i = 0; i < 370; i++) {
    if (dayCursor > endBound) return null;

    const keyForDow = dowKeyFromDate(dayCursor);
    if (keyForDow && assignment.routineDayKeys.includes(keyForDow)) {
      const shiftStart = new Date(dayCursor);
      shiftStart.setHours(sh, sm, 0, 0);
      const shiftEnd = new Date(dayCursor);
      shiftEnd.setHours(eh, em, 0, 0);

      if (
        shiftStart >= startBound &&
        shiftStart <= endBound &&
        shiftStart >= now
      ) {
        return {
          start: shiftStart,
          end: shiftEnd,
          assignmentId: assignment._id,
          supportTitle: assignment.supportTitle || "Support",
          participantId: assignment.participantId,
        };
      }
    }

    dayCursor.setDate(dayCursor.getDate() + 1);
    dayCursor.setHours(0, 0, 0, 0);
  }
  return null;
}

export function computeEarliestRoutineShift(now, assignments) {
  let best = null;
  for (const a of assignments) {
    const occ = computeNextShiftOccurrence(now, a);
    if (!occ) continue;
    if (!best || occ.start.getTime() < best.start.getTime()) best = occ;
  }
  return best;
}

export function computeEarliestScheduledShift(now, shifts) {
  let best = null;
  for (const s of shifts) {
    const d = new Date(s.shiftDate);
    const [h, m] = s.startTime.split(":").map(Number);
    const [eh, em] = s.endTime.split(":").map(Number);
    const start = new Date(d);
    start.setHours(h, m, 0, 0);
    const end = new Date(d);
    end.setHours(eh, em, 0, 0);
    if (start < now) continue;
    const cand = {
      start,
      end,
      supportTitle: s.serviceType || "Scheduled shift",
      participantId: s.participantId,
    };
    if (!best || cand.start.getTime() < best.start.getTime()) best = cand;
  }
  return best;
}

export function pickEarlierShift(a, b) {
  if (!a) return b || null;
  if (!b) return a;
  return a.start.getTime() <= b.start.getTime() ? a : b;
}
