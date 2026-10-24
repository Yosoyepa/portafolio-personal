"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type RefObject } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { ArrowUpRight, GithubLogo } from "@phosphor-icons/react";
import SectionHeading from "@/components/SectionHeading";
import AmbientBackground from "@/components/AmbientBackground";
import BorderGlow from "@/components/reactbits/BorderGlow";
import AsciiPlanet from "@/components/ui/ascii-planet";
import { ActivityHeatmap, RollingNumber, type ActivityHeatmapStrings } from "@/components/ui/activity-heatmap";
import { useLang } from "@/components/providers/LanguageProvider";
import { GITHUB_URL } from "@/lib/content";
import { activeDays, longestStreak, monthlyTotals, quartileThresholds, recordDay, toDays } from "@/lib/activityStats.mjs";
import snapshot from "@/data/github-activity.json";
import "./activity.css";

type Range = (typeof snapshot.ranges)[number];

const LABELS = {
  es: {
    kicker: "ACTIVIDAD", title: "Código que no se detiene.",
    description: "Mi actividad en GitHub, día a día. Incluye las contribuciones privadas que GitHub muestra de forma anónima.",
    bio: "Senior AI Engineer · agentes, calidad de software y cloud.", languages: (repos: number) => `Lenguajes · ${repos} repos públicos`, other: "Otros",
    lastYear: "Último año", lastYearPeriod: "el último año", ranges: "Rango de actividad", grid: (period: string) => `Contribuciones en ${period}`,
    unit: { one: "contribución", other: "contribuciones" }, day: { one: "día", other: "días" }, none: "sin contribuciones",
    stats: ["Contribuciones", "Días activos", "Racha más larga", "Día récord"], inPeriod: (period: string) => `en ${period}`, ofDays: (days: string) => `de ${days} días`,
    rhythm: "Ritmo mensual", peak: "pico", empty: "Selecciona un día para ver su registro.", locale: "es-CO",
    planetAlt: "Planeta con anillos dibujado con caracteres ASCII",
  },
  en: {
    kicker: "ACTIVITY", title: "Code that keeps shipping.",
    description: "My GitHub activity, day by day. It includes the private contributions GitHub shows anonymously.",
    bio: "Senior AI Engineer · agents, software quality and cloud.", languages: (repos: number) => `Languages · ${repos} public repos`, other: "Other",
    lastYear: "Last year", lastYearPeriod: "the last year", ranges: "Activity range", grid: (period: string) => `Contributions in ${period}`,
    unit: { one: "contribution", other: "contributions" }, day: { one: "day", other: "days" }, none: "no contributions",
    stats: ["Contributions", "Active days", "Longest streak", "Record day"], inPeriod: (period: string) => `in ${period}`, ofDays: (days: string) => `of ${days} days`,
    rhythm: "Monthly rhythm", peak: "peak", empty: "Select a day to see its log.", locale: "en-US",
    planetAlt: "Ringed planet drawn in ASCII characters",
  },
};

/** Spanish words for the heatmap. English keeps the component's own defaults except the legend: on this dark theme
 *  busier days are brighter, not darker. */
const ES_STRINGS: Partial<ActivityHeatmapStrings> = {
  in: "en", none: "Sin", to: "a", orMore: "o más", day: "día", days: "días", with: "con", less: "Menos", more: "Más",
  highlightGroup: "Resaltar días por nivel", highlightDays: "Resaltar días:", legend: "Los cuadros más intensos indican más", levels: "Niveles",
};
const EN_STRINGS: Partial<ActivityHeatmapStrings> = { legend: "Brighter squares mean more" };

const TYPE_MS = 18, ERASE_MS = 9;
/** The range sweep recolors the grid for about 740 ms; the commit pulse waits for it. */
const SWEEP_MS = 760, PULSE_MS = 900;
const DAY = 86_400_000;

const noopSubscribe = () => () => {};
/** Reduced motion only after hydration, so the server and the first client render agree. */
function useReducedMotionSafe() {
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const reduced = useReducedMotion();
  return hydrated && !!reduced;
}

const plural = (count: number, word: { one: string; other: string }) => (count === 1 ? word.one : word.other);
const utc = (iso: string) => new Date(Date.parse(`${iso}T00:00:00Z`));

/** "24 oct 2026" in Spanish, "Oct 24, 2026" in English. */
function compactDate(iso: string, locale: string, withYear = true) {
  const format = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", ...(withYear && { year: "numeric" }), timeZone: "UTC" });
  if (!locale.startsWith("es")) return format.format(utc(iso));
  const parts = Object.fromEntries(format.formatToParts(utc(iso)).map(part => [part.type, part.value]));
  return [parts.day, parts.month.replace(".", ""), parts.year].filter(Boolean).join(" ");
}

function streakDates(start: string, end: string, locale: string) {
  if (start === end) return compactDate(start, locale);
  if (!locale.startsWith("es"))
    return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).formatRange(utc(start), utc(end));
  if (start.slice(0, 7) === end.slice(0, 7)) return `${Number(start.slice(8))}–${compactDate(end, locale)}`;
  return start.slice(0, 4) === end.slice(0, 4)
    ? `${compactDate(start, locale, false)} – ${compactDate(end, locale)}`
    : `${compactDate(start, locale)} – ${compactDate(end, locale)}`;
}

const command = (range: Range) =>
  range.id === "last-year"
    ? `git log --author=yosoyepa --since="1 year ago"`
    : `git log --author=yosoyepa --since=${range.start} --until=${range.end}`;

type Part = { text: string; tone?: string };
/** Shell words: `git` and `log` in their own tones, flags muted and their values lit. A quoted value stays one word,
 *  and lines only break between words. */
function words(text: string): Part[][] {
  return [...text.matchAll(/--[\w-]+=(?:"[^"]*"|\S+)|"[^"]*"|\S+|\s+/g)].map(([word], index) => {
    if (!word.trim()) return [{ text: word }];
    if (index === 0) return [{ text: word, tone: "gh-tok-bin" }];
    if (!word.startsWith("--")) return [{ text: word, tone: "gh-tok-cmd" }];
    const cut = word.indexOf("=") + 1;
    return cut ? [{ text: word.slice(0, cut), tone: "gh-tok-flag" }, { text: word.slice(cut), tone: "gh-tok-value" }] : [{ text: word, tone: "gh-tok-flag" }];
  });
}

/** The first `length` characters of the command, coloured word by word. */
function Shell({ text, length }: { text: string; length: number }) {
  let offset = 0;
  return words(text).map((parts, index) => {
    const shown = parts
      .map(part => {
        const visible = part.text.slice(0, Math.max(0, length - offset));
        offset += part.text.length;
        return { ...part, visible };
      })
      .filter(part => part.visible);
    if (!shown.length) return null;
    // Spaces stay plain text: they are where the line may break.
    if (!shown[0].tone) return shown[0].visible;
    return <span key={index} className="gh-word">{shown.map((part, key) => <span key={key} className={part.tone}>{part.visible}</span>)}</span>;
  });
}

/** Types the command once the panel is in view. A new range erases back to the shared prefix and types the rest.
 *  Progress follows the clock, not the number of frames, so a busy main thread cannot slow the typing down. */
function TypedCommand({ text, start, reduced }: { text: string; start: boolean; reduced: boolean }) {
  const [typed, setTyped] = useState("");
  const typedRef = useRef("");
  useEffect(() => {
    if (!start) return;
    if (reduced) {
      typedRef.current = text;
      setTyped(text);
      return;
    }
    const from = typedRef.current;
    let shared = 0;
    while (shared < from.length && from[shared] === text[shared]) shared++;
    const erase = from.length - shared, type = text.length - shared;
    const began = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const elapsed = now - began;
      const erased = Math.min(erase, Math.floor(elapsed / ERASE_MS));
      const written = erased < erase ? 0 : Math.min(type, Math.floor((elapsed - erase * ERASE_MS) / TYPE_MS));
      const next = erased < erase ? from.slice(0, from.length - erased) : text.slice(0, shared + written);
      if (next !== typedRef.current) {
        typedRef.current = next;
        setTyped(next);
      }
      if (next !== text) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [text, start, reduced]);

  return (
    <code className="gh-command">
      <span className="gh-prompt" aria-hidden="true">$</span>
      <span className="sr-only">{text}</span>
      {/* The full command, invisible, holds the final height so the panel does not move while it is typed. */}
      <span className="gh-command-text" aria-hidden="true">
        <span className="gh-command-ghost"><Shell text={text} length={text.length} /><span className="gh-caret" /></span>
        <span className="gh-command-typed"><Shell text={text} length={typed.length} /><span className="gh-caret" data-typing={typed !== text || undefined} /></span>
      </span>
    </code>
  );
}

/** Once the wave has landed, or a new range has finished its sweep, the latest active day beats three times. */
function useCommitPulse(host: RefObject<HTMLDivElement | null>, index: number, rangeId: string, reduced: boolean) {
  const landed = useRef(false);
  useEffect(() => {
    const grid = host.current?.querySelector<HTMLElement>('[role="grid"]');
    if (!grid || reduced || index < 0) return;
    let timer = 0, cell: HTMLElement | null = null, observer: MutationObserver | null = null;
    const beat = () => {
      cell = grid.querySelector<HTMLElement>(`[data-index="${index}"]`);
      cell?.setAttribute("data-pulse", "");
      timer = window.setTimeout(() => cell?.removeAttribute("data-pulse"), PULSE_MS * 3 + 80);
    };
    const settle = () => {
      timer = window.setTimeout(beat, landed.current ? SWEEP_MS : 0);
      landed.current = true;
    };
    if (grid.dataset.reveal === "done") settle();
    else {
      observer = new MutationObserver(() => {
        if (grid.dataset.reveal !== "done") return;
        observer?.disconnect();
        settle();
      });
      observer.observe(grid, { attributes: true, attributeFilter: ["data-reveal"] });
    }
    return () => {
      observer?.disconnect();
      window.clearTimeout(timer);
      cell?.removeAttribute("data-pulse");
    };
  }, [host, index, rangeId, reduced]);
}

function Stat({ label, value, unit, detail, locale, reduced }: { label: string; value: number; unit?: string; detail: string; locale: string; reduced: boolean }) {
  return (
    <div className="gh-stat">
      <dt>{label}</dt>
      <dd>
        <span className="gh-stat-value" aria-hidden="true">
          <RollingNumber value={value} locale={locale} reduced={reduced} />
          {unit && <span className="gh-stat-unit">{unit}</span>}
        </span>
        <span className="sr-only">{new Intl.NumberFormat(locale).format(value)}{unit && ` ${unit}`}</span>
        <small>{detail}</small>
      </dd>
    </div>
  );
}

/** The same days, a step back: one bar per calendar month of the range, the busiest one lit. */
function MonthlyRhythm({ months, shown, back, lang }: { months: { month: string; total: number }[]; shown: boolean; back: boolean; lang: "es" | "en" }) {
  const ui = LABELS[lang];
  const max = Math.max(1, ...months.map(month => month.total));
  const peak = months.reduce((top, month, index) => (month.total > 0 && month.total >= months[top].total ? index : top), 0);
  const short = new Intl.DateTimeFormat(ui.locale, { month: "short", timeZone: "UTC" });
  const full = new Intl.DateTimeFormat(ui.locale, { month: "long", year: "numeric", timeZone: "UTC" });
  const number = new Intl.NumberFormat(ui.locale);
  const at = (month: string) => utc(`${month}-01`);
  return (
    <div className="gh-rhythm">
      <div className="gh-rhythm-head">
        <p className="gh-label" id="gh-rhythm-label">{ui.rhythm}</p>
        {months[peak]?.total > 0 && (
          <p className="gh-rhythm-peak">{ui.peak} <span>{short.format(at(months[peak].month))} {months[peak].month.slice(0, 4)}</span> · {number.format(months[peak].total)}</p>
        )}
      </div>
      <ol className="gh-months" aria-labelledby="gh-rhythm-label" data-shown={shown || undefined} data-direction={back ? "back" : undefined}
        style={{ "--months": months.length } as CSSProperties}>
        {months.map((month, index) => (
          <li key={index} data-peak={(index === peak && month.total > 0) || undefined} data-empty={month.total === 0 || undefined}
            style={{ "--ratio": month.total / max, "--order": index, "--order-back": months.length - 1 - index } as CSSProperties}>
            <span className="gh-month-bar" aria-hidden="true"><i /></span>
            <span className="gh-month-label" aria-hidden="true">{short.format(at(month.month))}</span>
            <span className="sr-only">{full.format(at(month.month))}: {number.format(month.total)} {plural(month.total, ui.unit)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ProfileCard({ lang }: { lang: "es" | "en" }) {
  const ui = LABELS[lang];
  const ref = useRef<HTMLDivElement>(null);
  const shown = useInView(ref, { once: true, amount: 0.6 });
  const percent = new Intl.NumberFormat(ui.locale, { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return (
    <BorderGlow className="gh-card gh-profile">
      <div className="gh-frame">
        <p className="gh-frame-bar"><span>~/yosoyepa $</span> ./orbit --live</p>
        <div className="gh-avatar">
          <AsciiPlanet label={ui.planetAlt} />
        </div>
      </div>
      <div className="gh-identity">
        <h3>Juan Andrade</h3>
        <p className="gh-handle">@Yosoyepa</p>
        <p className="gh-bio">{ui.bio}</p>
        <a className="gh-link" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
          <GithubLogo size={17} aria-hidden="true" />github.com/Yosoyepa<ArrowUpRight size={15} aria-hidden="true" />
        </a>
      </div>
      <div className="gh-langs" ref={ref}>
        <p className="gh-label">{ui.languages(snapshot.publicRepos)}</p>
        <div className="gh-lang-bar" data-shown={shown || undefined} aria-hidden="true">
          {snapshot.languages.map((language, index) => (
            <i key={language.name} style={{ "--share": language.share, "--lang": language.color, "--order": index } as CSSProperties} />
          ))}
        </div>
        <ul className="gh-lang-list">
          {snapshot.languages.map(language => (
            <li key={language.name}>
              <i style={{ background: language.color }} aria-hidden="true" />
              {language.name === "Other" ? ui.other : language.name}
              <span>{percent.format(language.share)}</span>
            </li>
          ))}
        </ul>
      </div>
    </BorderGlow>
  );
}

/** The range switch offers the last 12 months and the two most recent calendar years. Older years hold a handful of
 *  contributions and leave gaps (2024 is a real zero) that read like missing data; the snapshot keeps them all. */
const RANGES = snapshot.ranges.filter((range, index, all) => range.id === "last-year" || all.filter(item => item.id !== "last-year").indexOf(range) < 2);

/** Same fit as the heatmap's own `clamp(9px, (100cqi - label - gap × 53) / 53, 15px)`, measured once per resize so the
 *  371 cells stop depending on a container query. */
function useCellSize(host: RefObject<HTMLElement | null>) {
  const [cell, setCell] = useState<number | undefined>(undefined);
  useEffect(() => {
    const node = host.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
      const next = Math.round(Math.min(15, Math.max(9, (width - 30 - 3 * 53) / 53)) * 4) / 4;
      setCell(current => (current === next ? current : next));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [host]);
  return cell;
}

function ActivityPanel({ lang }: { lang: "es" | "en" }) {
  const ui = LABELS[lang];
  const reduced = useReducedMotionSafe();
  const host = useRef<HTMLDivElement>(null);
  const inView = useInView(host, { once: true, amount: 0.35 });
  const cellSize = useCellSize(host);
  const [rangeId, setRangeId] = useState(RANGES[0].id);
  const [back, setBack] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const range = RANGES.find(item => item.id === rangeId) ?? RANGES[0];

  const stats = useMemo(() => {
    const { counts } = range;
    return {
      days: toDays(range),
      months: monthlyTotals(range),
      thresholds: quartileThresholds(counts),
      active: activeDays(counts),
      streak: longestStreak(counts),
      record: recordDay(counts),
      latest: counts.findLastIndex(count => count > 0),
    };
  }, [range]);
  useCommitPulse(host, stats.latest, range.id, reduced);

  const period = range.id === "last-year" ? ui.lastYearPeriod : range.id;
  const dateOf = (index: number) => stats.days[index]?.date ?? range.start;
  const number = new Intl.NumberFormat(ui.locale);
  const longDate = new Intl.DateTimeFormat(ui.locale, { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  const selectedIndex = selected ? Math.round((utc(selected).getTime() - utc(range.start).getTime()) / DAY) : -1;
  const selectedCount = range.counts[selectedIndex] ?? 0;

  const choose = (id: string) => {
    const next = RANGES.find(item => item.id === id);
    if (!next || next.id === range.id) return;
    // Like the heatmap's sweep: forward for a later range, back for an earlier one.
    setBack(next.start < range.start);
    setRangeId(id);
    if (selected && (selected < next.start || selected > next.end)) setSelected(null);
  };

  return (
    <BorderGlow className="gh-card gh-panel">
      <div className="gh-bar">
        <span className="gh-dots" aria-hidden="true"><i /><i /><i /></span>
        <TypedCommand text={command(range)} start={inView} reduced={reduced} />
        <time className="gh-chip" dateTime={snapshot.generatedAt}>snapshot {compactDate(snapshot.generatedAt.slice(0, 10), ui.locale)}</time>
      </div>
      <div className="gh-screen" ref={host}>
        <ActivityHeatmap
          days={stats.days}
          label={ui.grid(period)}
          period={period}
          unit={ui.unit}
          locale={ui.locale}
          weekStartsOn={0}
          thresholds={stats.thresholds}
          cellSize={cellSize}
          strings={lang === "es" ? ES_STRINGS : EN_STRINGS}
          selectedDate={selected}
          onSelectDate={setSelected}
          actions={
            <div className="segmented-control gh-ranges" role="group" aria-label={ui.ranges}>
              {RANGES.map(item => (
                <button key={item.id} type="button" aria-pressed={item.id === range.id} onClick={() => choose(item.id)}>
                  {item.id === range.id && <motion.span className="segment-indicator" layoutId="gh-range" transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 34 }} />}
                  <span className="relative">{item.id === "last-year" ? ui.lastYear : item.id}</span>
                </button>
              ))}
            </div>
          }
        />
        <dl className="gh-stats">
          <Stat label={ui.stats[0]} value={range.total} detail={ui.inPeriod(period)} locale={ui.locale} reduced={reduced} />
          <Stat label={ui.stats[1]} value={stats.active} detail={ui.ofDays(number.format(range.counts.length))} locale={ui.locale} reduced={reduced} />
          <Stat label={ui.stats[2]} value={stats.streak.length} unit={plural(stats.streak.length, ui.day)} locale={ui.locale} reduced={reduced}
            detail={stats.streak.length ? streakDates(dateOf(stats.streak.start), dateOf(stats.streak.end), ui.locale) : "—"} />
          <Stat label={ui.stats[3]} value={stats.record.count} unit={plural(stats.record.count, ui.unit)} locale={ui.locale} reduced={reduced}
            detail={stats.record.index >= 0 ? compactDate(dateOf(stats.record.index), ui.locale) : "—"} />
        </dl>
        <MonthlyRhythm months={stats.months} shown={inView} back={back} lang={lang} />
        <p className="gh-log" aria-live="polite">
          {selected ? (
            <span key={selected} className="gh-log-entry">
              <span className="gh-log-dot" aria-hidden="true">●</span>{" "}
              <span className="gh-log-hash" aria-hidden="true">{selected}</span>{" "}
              <span className="gh-log-sep" aria-hidden="true">·</span>{" "}
              {longDate.format(utc(selected))}{" "}
              <span className="gh-log-sep" aria-hidden="true">·</span>{" "}
              <strong>{selectedCount ? `${number.format(selectedCount)} ${plural(selectedCount, ui.unit)}` : ui.none}</strong>
            </span>
          ) : (
            <span className="gh-log-empty">{ui.empty}</span>
          )}
        </p>
      </div>
    </BorderGlow>
  );
}

export default function Activity() {
  const { lang } = useLang();
  const ui = LABELS[lang];
  return (
    <section id="actividad" className="relative isolate overflow-hidden py-24 md:py-32">
      <AmbientBackground variant="mesh" />
      <div className="relative mx-auto w-full max-w-6xl px-6">
        <div className="section-intro">
          <SectionHeading kicker={ui.kicker} title={ui.title} />
          <p data-reveal className="section-description">{ui.description}</p>
        </div>
        <div className="gh-activity">
          <ProfileCard lang={lang} />
          <ActivityPanel lang={lang} />
        </div>
      </div>
    </section>
  );
}
