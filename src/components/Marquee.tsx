"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

import { Brain, Coin, FileText, FlowArrow, Robot, type Icon } from "@phosphor-icons/react";
import BrandIcon from "@/components/BrandIcon";

// Las tecnologías con marca muestran su logo (BrandIcon); los conceptos sin marca conservan su icono Phosphor.
const ITEMS: { label: string; icon?: Icon }[] = [
  { label: "Python" },
  { label: "TypeScript" },
  { label: "Java" },
  { label: "Amazon Bedrock" },
  { label: "Strands Agents", icon: Robot },
  { label: "LangChain" },
  { label: "FastAPI" },
  { label: "Spring Boot" },
  { label: "AWS CDK" },
  { label: "ECS Fargate" },
  { label: "Lambda" },
  { label: "DynamoDB" },
  { label: "Kinesis" },
  { label: "OpenSearch" },
  { label: "Docker" },
  { label: "Airflow" },
  { label: "RAG", icon: FileText },
  { label: "MCP" },
  { label: "LLMOps", icon: Brain },
  { label: "FinOps", icon: Coin },
  { label: "Event-Driven", icon: FlowArrow },
  { label: "OpenTelemetry" },
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
