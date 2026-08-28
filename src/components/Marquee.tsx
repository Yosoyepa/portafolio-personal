"use client";

import {
  Brain,
  Cloud,
  Code,
  Coffee,
  Coin,
  Cube,
  Database,
  FileText,
  FileTs,
  FlowArrow,
  Function,
  Leaf,
  Lightning,
  Link,
  MagnifyingGlass,
  Plugs,
  Robot,
  Sparkle,
  Stack,
  Terminal,
  Waveform,
  Wind,
  type Icon,
} from "@phosphor-icons/react";

const ITEMS: { label: string; icon: Icon }[] = [
  { label: "Python", icon: Code },
  { label: "TypeScript", icon: FileTs },
  { label: "Java", icon: Coffee },
  { label: "Amazon Bedrock", icon: Sparkle },
  { label: "Strands Agents", icon: Robot },
  { label: "LangChain", icon: Link },
  { label: "FastAPI", icon: Lightning },
  { label: "Spring Boot", icon: Leaf },
  { label: "AWS CDK", icon: Stack },
  { label: "ECS Fargate", icon: Cube },
  { label: "Lambda", icon: Function },
  { label: "DynamoDB", icon: Database },
  { label: "Kinesis", icon: Waveform },
  { label: "OpenSearch", icon: MagnifyingGlass },
  { label: "Docker", icon: Terminal },
  { label: "Airflow", icon: Wind },
  { label: "RAG", icon: FileText },
  { label: "MCP", icon: Plugs },
  { label: "LLMOps", icon: Brain },
  { label: "FinOps", icon: Coin },
  { label: "Event-Driven", icon: FlowArrow },
  { label: "OpenTelemetry", icon: Cloud },
];

export default function Marquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div
      aria-hidden
      className="relative border-y border-white/[0.06] bg-panel/60 py-5 marquee-mask overflow-hidden"
    >
      <div className="flex w-max animate-marquee items-center gap-3 pr-3">
        {row.map((item, i) => (
          <span
            key={`${item.label}-${i}`}
            className="flex items-center gap-2 whitespace-nowrap rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2"
          >
            <item.icon size={13} className="text-cyan/80" aria-hidden />
            <span className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase">
              {item.label}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
