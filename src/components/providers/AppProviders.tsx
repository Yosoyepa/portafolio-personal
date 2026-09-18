"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";
import { LanguageProvider } from "./LanguageProvider";
import SmoothScroll from "./SmoothScroll";
import SkipLink from "@/components/SkipLink";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <MotionConfig reducedMotion="user">
        <SmoothScroll>
          <SkipLink />
          {children}
        </SmoothScroll>
      </MotionConfig>
    </LanguageProvider>
  );
}
