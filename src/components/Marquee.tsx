"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

import { Brain, FileText, Robot, Scan, type Icon } from "@phosphor-icons/react";
import BrandIcon from "@/components/BrandIcon";

// Las tecnologías con marca muestran su logo (BrandIcon); los conceptos sin marca conservan su icono Phosphor.
const ITEMS: { label: string; icon?: Icon }[] = [
  { label: "Python" },
  { label: "TypeScript" },
  { label: "Rust" },
  { label: "FastAPI" },
  { label: "RabbitMQ" },
  { label: "PostgreSQL" },
  { label: "OpenShift" },
  { label: "Argo CD" },
  { label: "Podman" },
  { label: "Amazon Bedrock" },
  { label: "Claude" },
  { label: "Gemini" },
  { label: "MCP" },
  { label: "Strands Agents", icon: Robot },
  { label: "LangChain" },
  { label: "AWS CDK" },
  { label: "Lambda" },
  { label: "DynamoDB" },
  { label: "ONNX Runtime" },
  { label: "OCR", icon: Scan },
  { label: "SonarQube" },
  { label: "Trivy" },
  { label: "GitHub Actions" },
  { label: "OpenTelemetry" },
  { label: "RAG", icon: FileText },
  { label: "LLMOps", icon: Brain },
];

export default function Marquee() {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref);
  const reduce = useReducedMotion();
  const [tabVisible, setTabVisible] = useState(true);
  useEffect(() => {
    const update = () => setTabVisible(!document.hidden);
    update(); document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  const row = [...ITEMS, ...ITEMS];
  return (
    <div
      ref={ref}
      aria-hidden
      className="relative border-y border-white/[0.06] bg-panel/60 py-5 marquee-mask overflow-hidden"
    >
      <div className="flex w-max animate-marquee items-center gap-3 pr-3" style={{ animationPlayState: visible && tabVisible && !reduce ? "running" : "paused" }}>
        {row.map((item, i) => (
          <span
            key={`${item.label}-${i}`}
            className="flex items-center gap-2 whitespace-nowrap rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2"
          >
            {item.icon ? <item.icon size={13} className="text-cyan/80" aria-hidden /> : <BrandIcon name={item.label} size={14} />}
            <span className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase">
              {item.label}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
