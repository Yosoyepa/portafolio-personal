import type { SVGProps } from "react";

export type PortfolioIconName = "profile" | "journey" | "projects" | "stack" | "award" | "contact" | "code" | "ai" | "data" | "cloud";

/** Original geometric SVG family, inspired by Spectrum's orbital and modular shapes. */
export default function PortfolioIcon({ name, ...props }: SVGProps<SVGSVGElement> & { name: PortfolioIconName }) {
  const shapes = {
    profile: <><circle cx="16" cy="11" r="4" /><path d="M7 26c0-6 4-9 9-9s9 3 9 9" /><path d="M5 9V5h4M23 5h4v4" opacity=".45" /></>,
    journey: <><path d="M7 25V11a4 4 0 0 1 8 0v10a4 4 0 0 0 8 0V7" /><circle cx="7" cy="26" r="2" fill="currentColor" /><path d="m19 10 4-4 4 4" /></>,
    projects: <><path d="m16 3 12 7-12 7L4 10 16 3Z" fill="currentColor" fillOpacity=".12" /><path d="m4 16 12 7 12-7M4 22l12 7 12-7M16 17v12" /></>,
    stack: <><rect x="4" y="4" width="9" height="9" rx="2" /><rect x="19" y="4" width="9" height="9" rx="2" fill="currentColor" fillOpacity=".25" /><rect x="4" y="19" width="9" height="9" rx="2" fill="currentColor" fillOpacity=".25" /><rect x="19" y="19" width="9" height="9" rx="2" /></>,
    award: <><path d="m16 3 3 5 6-1-1 6 5 3-5 3 1 6-6-1-3 5-3-5-6 1 1-6-5-3 5-3-1-6 6 1 3-5Z" fill="currentColor" fillOpacity=".1" /><path d="m12 16 3 3 6-6" /></>,
    contact: <><path d="M27 5 5 14l9 4 4 9 9-22Z" fill="currentColor" fillOpacity=".15" /><path d="m14 18 7-7M6 22l-3 3M10 26l-2 3" /></>,
    code: <><path d="m10 8-7 8 7 8m12-16 7 8-7 8M19 5l-6 22" /></>,
    ai: <><path d="M16 2c0 9 5 14 14 14-9 0-14 5-14 14 0-9-5-14-14-14C11 16 16 11 16 2Z" fill="currentColor" fillOpacity=".15" /><circle cx="16" cy="16" r="3" /></>,
    data: <><ellipse cx="16" cy="7" rx="11" ry="4" /><path d="M5 7v17c0 5 22 5 22 0V7M5 15c0 5 22 5 22 0" /><path d="M11 21h.1M16 22h.1" strokeWidth="3" /></>,
    cloud: <><path d="M9 24a7 7 0 1 1 0-14 9 9 0 0 1 17 3 6 6 0 0 1-1 11" /><path d="M16 29V15m-5 5 5-5 5 5" /></>,
  };
  return <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>{shapes[name]}</svg>;
}
