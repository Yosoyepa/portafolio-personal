"use client";

import type { ReactNode } from "react";
import { LanguageProvider } from "./LanguageProvider";
import SmoothScroll from "./SmoothScroll";
import SkipLink from "@/components/SkipLink";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <SmoothScroll>
        <SkipLink />
        {children}
      </SmoothScroll>
    </LanguageProvider>
  );
}
