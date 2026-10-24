import test from 'node:test';
import assert from 'node:assert/strict';
import { activeDays, longestStreak, currentStreak, recordDay, quartileThresholds, toDays, monthlyTotals } from '../src/lib/activityStats.mjs';

const NONE = { length: 0, start: -1, end: -1 };

test('a range with no activity has no streaks, no record and the minimum thresholds', () => {
  const counts = new Array(366).fill(0);
  assert.equal(activeDays(counts), 0);
  assert.deepEqual(longestStreak(counts), NONE);
  assert.equal(currentStreak(counts), 0);
  assert.deepEqual(recordDay(counts), { index: -1, count: 0 });
  assert.deepEqual(quartileThresholds(counts), [1, 2, 3]);
  assert.deepEqual([activeDays([]), longestStreak([]), currentStreak([]), recordDay([]), quartileThresholds([])],
    [0, NONE, 0, { index: -1, count: 0 }, [1, 2, 3]]);
});

test('a single active day is its own streak and record', () => {
  const counts = [0, 0, 5, 0, 0];
  assert.equal(activeDays(counts), 1);
  assert.deepEqual(longestStreak(counts), { length: 1, start: 2, end: 2 });
  assert.equal(currentStreak(counts), 0);
  assert.deepEqual(recordDay(counts), { index: 2, count: 5 });
  // Every quartile is 5; the bounds still climb one step at a time so each level stays reachable.
  assert.deepEqual(quartileThresholds(counts), [5, 6, 7]);
});

test('a streak that runs to the last day is both the longest and the current one', () => {
  const counts = [1, 1, 0, 2, 0, 3, 1, 4, 2];
  assert.deepEqual(longestStreak(counts), { length: 4, start: 5, end: 8 });
  assert.equal(currentStreak(counts), 4);
  assert.equal(currentStreak([3, 2, 0]), 0);
  assert.equal(currentStreak([0, 0, 9]), 1);
  assert.deepEqual(longestStreak([7, 7, 7]), { length: 3, start: 0, end: 2 });
});

test('ties go to the most recent streak and the most recent record day', () => {
  assert.deepEqual(longestStreak([1, 1, 0, 0, 2, 2, 0]), { length: 2, start: 4, end: 5 });
  assert.deepEqual(longestStreak([1, 1, 1, 0, 2, 2, 0]), { length: 3, start: 0, end: 2 });
  assert.deepEqual(recordDay([0, 9, 3, 9, 1]), { index: 3, count: 9 });
  assert.deepEqual(recordDay([12, 0, 4]), { index: 0, count: 12 });
});

test('negative noise never counts as activity', () => {
  assert.equal(activeDays([-1, 0, 2, 0]), 1);
  assert.deepEqual(longestStreak([-3, 2, -1, 4, 4]), { length: 2, start: 3, end: 4 });
});

test('thresholds are the quartiles of active days, as increasing integers', () => {
  // Active days 1..8: one quarter of them per level.
  assert.deepEqual(quartileThresholds([0, 1, 2, 3, 4, 5, 6, 7, 8, 0]), [2, 4, 6]);
  // Quiet days do not drag the bounds down.
  assert.deepEqual(quartileThresholds([0, 0, 0, 0, 0, 0, 10, 20, 30, 40]), [10, 20, 30]);
  // Repeated values collapse, and the bounds are pushed apart to stay strictly increasing.
  assert.deepEqual(quartileThresholds([0, 3, 3, 3, 3]), [3, 4, 5]);
  assert.deepEqual(quartileThresholds([1, 1, 1, 1, 1, 1, 1, 50]), [1, 2, 3]);
  for (const counts of [[1], [2, 2], [0, 1, 9, 9, 9, 9, 40], Array.from({ length: 366 }, (_, i) => (i * 7919) % 23)]) {
    const [a, b, c] = quartileThresholds(counts);
    assert.ok(Number.isInteger(a) && Number.isInteger(b) && Number.isInteger(c), `integers for ${counts}`);
    assert.ok(a >= 1 && a < b && b < c, `strictly increasing from 1 for ${counts}: ${[a, b, c]}`);
  }
});

test('toDays expands a compact range into dated days across month, leap-day and year boundaries', () => {
  assert.deepEqual(toDays({ start: '2024-02-28', counts: [1, 0, 3] }), [
    { date: '2024-02-28', count: 1 },
    { date: '2024-02-29', count: 0 },
    { date: '2024-03-01', count: 3 },
  ]);
  assert.deepEqual(toDays({ start: '2025-12-31', counts: [4, 2] }).map(day => day.date), ['2025-12-31', '2026-01-01']);
  assert.deepEqual(toDays({ start: '2026-03-07', counts: [] }), []);
  // A full year keeps one entry per calendar day and ends on its last day.
  const year = toDays({ start: '2026-01-01', counts: new Array(365).fill(0) });
  assert.equal(year.length, 365);
  assert.equal(year.at(-1).date, '2026-12-31');
});

test('monthlyTotals adds each calendar month the range touches, partial months and quiet months included', () => {
  // 2025-12-30 … 2026-02-02: two days of December, all of January, two days of February.
  const counts = [2, 3, ...new Array(31).fill(1), 0, 4];
  assert.deepEqual(monthlyTotals({ start: '2025-12-30', counts }), [
    { month: '2025-12', total: 5 },
    { month: '2026-01', total: 31 },
    { month: '2026-02', total: 4 },
  ]);
  assert.deepEqual(monthlyTotals({ start: '2026-03-31', counts: [0, 0] }), [{ month: '2026-03', total: 0 }, { month: '2026-04', total: 0 }]);
  assert.deepEqual(monthlyTotals({ start: '2026-03-07', counts: [] }), []);
  // A calendar year has twelve months whose totals add up to the year.
  const year = Array.from({ length: 365 }, (_, i) => i % 3);
  const months = monthlyTotals({ start: '2025-01-01', counts: year });
  assert.equal(months.length, 12);
  assert.equal(months.reduce((sum, month) => sum + month.total, 0), year.reduce((a, b) => a + b, 0));
});
