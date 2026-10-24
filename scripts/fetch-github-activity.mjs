/* Snapshot of the public GitHub contribution calendar for the Activity section.
 * Usage: node scripts/fetch-github-activity.mjs
 * Token: GITHUB_TOKEN, or the output of `gh auth token`. It stays in memory: never printed, never written. */
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const LOGIN = "Yosoyepa";
const OUT = fileURLToPath(new URL("../src/data/github-activity.json", import.meta.url));
const TOP_LANGUAGES = 6;
const OTHER = { name: "Other", color: "#5d6680" };

const token = process.env.GITHUB_TOKEN?.trim() || execFileSync("gh", ["auth", "token"], { encoding: "utf8" }).trim();
if (!token) throw new Error("Missing token: set GITHUB_TOKEN or sign in with `gh auth login`.");

async function graphql(query, variables) {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json", "User-Agent": "portfolio-activity-snapshot" },
    body: JSON.stringify({ query, variables }),
  });
  if (!response.ok) throw new Error(`GitHub GraphQL ${response.status} ${response.statusText}`);
  const json = await response.json();
  if (json.errors?.length) throw new Error(json.errors.map(error => error.message).join("; "));
  return json.data;
}

const CALENDAR = `contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } }`;

/** One range in the compact shape: a start date and one count per day up to the end date. */
function compact(id, calendar) {
  const days = calendar.weeks.flatMap(week => week.contributionDays).sort((a, b) => a.date.localeCompare(b.date));
  assert.ok(days.length, `${id}: empty calendar`);
  const DAY = 86_400_000, start = Date.parse(`${days[0].date}T00:00:00Z`);
  const end = days.at(-1).date;
  const counts = new Array(Math.round((Date.parse(`${end}T00:00:00Z`) - start) / DAY) + 1).fill(0);
  for (const day of days) counts[Math.round((Date.parse(`${day.date}T00:00:00Z`) - start) / DAY)] += day.contributionCount;
  const total = calendar.totalContributions;
  assert.equal(counts.reduce((sum, count) => sum + count, 0), total, `${id}: daily counts do not add up to totalContributions`);
  return { id, start: days[0].date, end, total, counts };
}

/** Bytes per language across public, owned, non-fork repositories; top six plus "Other", shares rounded to four
 *  decimals with largest remainders so they add up to exactly 1. */
async function languages() {
  const bytes = new Map();
  let cursor = null, repos = 0;
  do {
    const data = await graphql(`query($login: String!, $cursor: String) { user(login: $login) {
      repositories(first: 100, after: $cursor, ownerAffiliations: OWNER, privacy: PUBLIC, isFork: false) {
        totalCount pageInfo { hasNextPage endCursor }
        nodes { languages(first: 10, orderBy: { field: SIZE, direction: DESC }) { edges { size node { name color } } } }
      } } }`, { login: LOGIN, cursor });
    const page = data.user.repositories;
    repos = page.totalCount;
    for (const repo of page.nodes)
      for (const { size, node } of repo.languages.edges) {
        const entry = bytes.get(node.name) ?? { name: node.name, color: node.color ?? OTHER.color, size: 0 };
        entry.size += size;
        bytes.set(node.name, entry);
      }
    cursor = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
  } while (cursor);

  const sorted = [...bytes.values()].sort((a, b) => b.size - a.size);
  const top = sorted.slice(0, TOP_LANGUAGES);
  const rest = sorted.slice(TOP_LANGUAGES).reduce((sum, entry) => sum + entry.size, 0);
  if (rest > 0) top.push({ ...OTHER, size: rest });
  const all = top.reduce((sum, entry) => sum + entry.size, 0);
  const units = top.map(entry => (entry.size / all) * 10_000);
  const floors = units.map(Math.floor);
  let missing = 10_000 - floors.reduce((sum, unit) => sum + unit, 0);
  units.map((unit, index) => ({ index, remainder: unit - floors[index] }))
    .sort((a, b) => b.remainder - a.remainder)
    .forEach(({ index }) => { if (missing > 0) { floors[index]++; missing--; } });
  const shares = top.map((entry, index) => ({ name: entry.name, color: entry.color, share: floors[index] / 10_000 }));
  assert.equal(floors.reduce((sum, unit) => sum + unit, 0), 10_000, "language shares do not add up to 1");
  return { shares, repos };
}

const now = new Date();
const profile = await graphql(`query($login: String!) { user(login: $login) { login createdAt contributionsCollection { ${CALENDAR} } } }`, { login: LOGIN });
const ranges = [compact("last-year", profile.user.contributionsCollection.contributionCalendar)];
const firstYear = new Date(profile.user.createdAt).getUTCFullYear();
for (let year = now.getUTCFullYear(); year >= firstYear; year--) {
  const from = `${year}-01-01T00:00:00Z`;
  const to = year === now.getUTCFullYear() ? now.toISOString() : `${year}-12-31T23:59:59Z`;
  const data = await graphql(`query($login: String!, $from: DateTime!, $to: DateTime!) { user(login: $login) {
    contributionsCollection(from: $from, to: $to) { ${CALENDAR} } } }`, { login: LOGIN, from, to });
  const calendar = data.user.contributionsCollection.contributionCalendar;
  if (calendar.totalContributions === 0) continue;
  ranges.push(compact(String(year), calendar));
}

const { shares, repos } = await languages();
const snapshot = { login: profile.user.login, generatedAt: now.toISOString(), ranges, languages: shares, publicRepos: repos };
// Readable diffs: two-space JSON, with each run of daily counts kept on one line.
const text = JSON.stringify(snapshot, null, 2).replace(/\[\s+([\d,\s]+?)\s+\]/g, (_, list) => `[${list.split(/,\s*/).join(",")}]`);
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, `${text}\n`);
console.log(`Wrote ${OUT}`);
for (const range of ranges) console.log(`  ${range.id.padEnd(9)} ${range.start} → ${range.end}  ${String(range.total).padStart(5)} contributions`);
console.log(`  languages: ${shares.map(entry => `${entry.name} ${(entry.share * 100).toFixed(2)}%`).join(", ")} · ${repos} public repos`);
