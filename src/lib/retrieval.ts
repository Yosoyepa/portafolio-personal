import type { Content } from "./content";

export type ProfileSource = {
  id: string;
  title: string;
  meta: string;
  passages: string[];
  href: string;
};

/** Only the portfolio's public, bilingual content is indexed in the browser. */
export function profileSources(content: Content): ProfileSource[] {
  return [
    ...content.experience.jobs.map((job, i) => ({
      id: `job-${i}`, title: job.company, meta: `${job.role} · ${job.period}`,
      passages: [job.summary, job.impact, ...job.bullets], href: "#experiencia",
    })),
    ...content.projects.items.map((project, i) => ({
      id: `project-${i}`, title: project.name, meta: project.tech.join(" · "),
      passages: [project.description, ...project.details, ...(project.award ? [project.award] : [])], href: "#proyectos",
    })),
    ...content.about.highlights.map((item, i) => ({
      id: `profile-${i}`, title: item.title, meta: content.about.kicker,
      passages: [item.desc], href: "#perfil",
    })),
    ...content.skills.groups.map((group, i) => ({
      id: `stack-${i}`, title: group.name, meta: content.skills.title,
      passages: [group.items.join(" · ")], href: "#stack",
    })),
    ...content.certs.groups.map((group, i) => ({
      id: `certs-${i}`, title: group.name, meta: content.certs.title,
      passages: group.items.map((item) => `${item.name} · ${item.issuer} · ${item.date}`), href: "#certificaciones",
    })),
    { id: "education", title: content.about.education.school, meta: content.about.education.period,
      passages: [content.about.education.degree, content.about.education.note], href: "#perfil" },
  ];
}

const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const STOP = new Set("que en de del el la los las un una y o a con por para como tu tus ti te me mi mis has eres tienes sobre cual cuales donde the and or in on at to with what how your you have has are about tell me is do does did experience experiencia sabes conoces trabajado trabajo work working trabajos proyectos projects".split(" "));
const ALIASES: Record<string, string[]> = {
  agentes: ["agents", "agente", "multi-agente", "agentic"], agents: ["agentes", "agente", "multi-agent", "agentic"],
  ia: ["ai", "genai", "bedrock"], ai: ["ia", "genai", "bedrock"],
  observabilidad: ["observability", "trazas", "traces", "kinesis"], observability: ["observabilidad", "traces", "trazas"],
  nube: ["cloud", "aws", "serverless"], cloud: ["nube", "aws", "serverless"],
  produccion: ["production", "despliegue", "deployment"], production: ["produccion", "deployment", "despliegue"],
  certificaciones: ["certified", "demonstrated", "certifications"], certifications: ["certified", "demonstrated", "certificaciones"],
  estudios: ["ingenieria", "universidad", "education"], education: ["university", "engineering", "universidad"],
  impacto: ["promovido", "contribuidor", "ganador", "16", "156"], impact: ["promoted", "contributor", "winner", "16", "156"],
  costos: ["finops", "cost", "coste"], cost: ["finops", "costos", "coste"],
  actualmente: ["presente", "present", "inetum"], current: ["present", "presente", "inetum"],
  trayectoria: ["inetum", "blend360"], career: ["inetum", "blend360"],
};

export function retrieveProfile(query: string, sources: ProfileSource[]): ProfileSource[] {
  const words = normalize(query).match(/[a-z0-9+#]+/g) ?? [];
  const significant = [...new Set(words.filter((word) => word.length > 1 && !STOP.has(word)))];
  if (!significant.length) {
    if (words.some((word) => ["experience", "experiencia", "trabajado", "trabajos", "working"].includes(word))) return sources.filter((source) => source.id.startsWith("job-")).map((source) => ({ ...source, passages: source.passages.slice(0, 2) }));
    if (words.some((word) => ["proyectos", "projects"].includes(word))) return sources.filter((source) => source.id.startsWith("project-")).slice(0, 3).map((source) => ({ ...source, passages: source.passages.slice(0, 1) }));
    return [];
  }
  const terms = [...new Set(significant.flatMap((word) => [word, ...(ALIASES[word] ?? [])]))];
  const scoreText = (text: string) => {
    const tokens = new Set(normalize(text).match(/[a-z0-9+#]+/g) ?? []);
    return terms.reduce((score, term) => score + (tokens.has(term) ? (significant.includes(term) ? 3 : 1) : 0), 0);
  };
  return sources.map((source) => {
    const passages = source.passages.map((text) => ({ text, score: scoreText(text) })).sort((a, b) => b.score - a.score);
    const score = scoreText(source.title) * 2 + scoreText(source.meta) + scoreText(source.passages.join(" "));
    return { source: { ...source, passages: passages.filter((p) => p.score > 0).map((p) => p.text).slice(0, 2) }, score };
  }).filter((entry) => entry.score >= 3).sort((a, b) => b.score - a.score).slice(0, 3).map(({ source }) => ({
    ...source, passages: source.passages.length ? source.passages : sources.find((original) => original.id === source.id)!.passages.slice(0, 2),
  }));
}
