/** Pure statistics over a compact contribution range: one count per day, oldest first.
 * A day is active when its count is above zero. Ties go to the most recent day or streak. */

const DAY = 86_400_000;

/** @typedef {{ length: number, start: number, end: number }} Streak  Indices are inclusive; an empty streak is -1/-1. */
/** @typedef {{ start: string, counts: number[] }} CompactRange  `start` is YYYY-MM-DD. */

/** @param {number[]} counts @returns {number} */
export function activeDays(counts) {
  let days = 0;
  for (const count of counts) if (count > 0) days++;
  return days;
}

/** @param {number[]} counts @returns {Streak} */
export function longestStreak(counts) {
  let best = { length: 0, start: -1, end: -1 }, run = 0;
  counts.forEach((count, index) => {
    run = count > 0 ? run + 1 : 0;
    if (run > 0 && run >= best.length) best = { length: run, start: index - run + 1, end: index };
  });
  return best;
}

/** Consecutive active days that end on the last day of the range.
 * @param {number[]} counts @returns {number} */
export function currentStreak(counts) {
  let run = 0;
  for (let index = counts.length - 1; index >= 0 && counts[index] > 0; index--) run++;
  return run;
}

/** @param {number[]} counts @returns {{ index: number, count: number }} */
export function recordDay(counts) {
  let record = { index: -1, count: 0 };
  counts.forEach((count, index) => {
    if (count > 0 && count >= record.count) record = { index, count };
  });
  return record;
}

/** Upper bounds for heatmap levels one to three: nearest-rank quartiles of the active days, pushed apart so they are
 * strictly increasing integers and never below [1, 2, 3].
 * @param {number[]} counts @returns {[number, number, number]} */
export function quartileThresholds(counts) {
  const active = counts.filter(count => count > 0).sort((a, b) => a - b);
  const rank = (/** @type {number} */ q) => (active.length ? Math.floor(active[Math.ceil(q * active.length) - 1]) : 0);
  const low = Math.max(1, rank(0.25));
  const mid = Math.max(low + 1, rank(0.5));
  return [low, mid, Math.max(mid + 1, rank(0.75))];
}

/** @param {CompactRange} range @returns {{ date: string, count: number }[]} */
export function toDays({ start, counts }) {
  const origin = Date.parse(`${start}T00:00:00Z`);
  return counts.map((count, index) => ({ date: new Date(origin + index * DAY).toISOString().slice(0, 10), count }));
}

/** One total per calendar month the range touches, oldest first; `month` is YYYY-MM.
 * @param {CompactRange} range @returns {{ month: string, total: number }[]} */
export function monthlyTotals(range) {
  /** @type {{ month: string, total: number }[]} */
  const months = [];
  for (const { date, count } of toDays(range)) {
    const month = date.slice(0, 7);
    if (months.at(-1)?.month !== month) months.push({ month, total: 0 });
    months[months.length - 1].total += Math.max(0, count);
  }
  return months;
}
