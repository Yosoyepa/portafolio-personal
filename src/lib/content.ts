import { caseStudies } from "./caseStudies.ts";
import career from "./career.ts";

/**
 * Contenido bilingüe (ES/EN) del portafolio de Juan Carlos Andrade Unigarro.
 * Editar este archivo para actualizar textos; ambas variantes deben tener la misma forma.
 * Convención tipográfica: sin em-dashes; rangos con – y separadores con ·
 */

export type Lang = "es" | "en";

// ─────────────────────────────────────────────────────────────────────────────
// Datos de contacto
// ─────────────────────────────────────────────────────────────────────────────
export const GITHUB_URL = "https://github.com/Yosoyepa";
export const EMAIL = "andradeunigarrojuancarlos@gmail.com";
export const LINKEDIN_URL = "https://www.linkedin.com/in/juan-carlos-andrade-unigarro/";

const es = {
  nav: {
    skip: "Saltar al contenido",
    home: "Inicio",
    about: "Perfil",
    experience: "Experiencia",
    projects: "Proyectos",
    stack: "Stack",
    certifications: "Certificaciones",
    contact: "Contacto",
  },
  hero: {
    lines: ["De una idea", "a un sistema", "que funciona."],
    intro: "Soy Juan Andrade. Conecto agentes de IA, ingeniería de software y cloud para llevar productos a producción.",
    work: "Explorar mi trabajo", contact: "Contactarme", current: "Actualmente en Inetum", place: "Colombia · Disponible para conectar",
    caption: "Datos que conectan. Agentes que actúan.", hint: "Activa una conexión y sigue la señal.",
    stages: ["Contexto", "Inteligencia", "Producción"],
    details: ["Datos, retrieval y memoria: la información que un agente necesita para actuar.", "Modelos, herramientas y reglas: decisiones dentro de un sistema controlado.", "Infraestructura, evaluación y trazas: lo que permite operarlo cada día."],
    proof: ["Agentes & RAG", "Inteligencia documental", "AWS & plataformas"], scroll: "Conoce cómo trabajo",
  },
  metrics: {
    items: [
      { value: 20, suffix: "+", label: "Repositorios con contribuciones" },
      { value: 500, suffix: "+", label: "Commits rastreados" },
      { value: 16, suffix: "+", label: "Componentes de IA en producción" },
      { value: 8, suffix: "", label: "Credenciales y microcredenciales AWS" },
    ],
  },
  about: {
    kicker: "PERFIL",
    title: "De los modelos al sistema completo.",
    ghost: "PERFIL",
    paragraphs: [
      "Conecto IA, backend e infraestructura para construir productos que se puedan desplegar, observar y mantener. Me involucro desde la arquitectura hasta los detalles que hacen fiable una entrega.",
      "Hoy trabajo en inteligencia documental en Inetum. Antes, en Blend360, desarrollé agentes sobre Bedrock, observabilidad de LLMs y plataformas de despliegue con AWS CDK. En mis proyectos públicos exploro cómo darle control y evidencia al software que usa IA.",
      "Estudio Ingeniería de Sistemas y Computación en la Universidad Nacional de Colombia. Trabajo en español e inglés (B2), con atención a la calidad, la seguridad y el coste de operación.",
    ],
    highlights: [
      { title: "Arquitectura de agentes IA", desc: "Sistemas multi-agente con Strands Agents SDK, clasificación de intención, tool use y MCP." },
      { title: "LLM en producción", desc: "Amazon Bedrock (Claude, Nova, Mistral), Function Calling, streaming y RAG con Knowledge Bases." },
      { title: "RAG engineering", desc: "Pipelines con OpenSearch, pgvector, reranking, memoria persistente y evaluación con Ragas." },
      { title: "Observabilidad de IA", desc: "Trazabilidad distribuida de agentes (grafos, nodos, edges) con Kinesis y patrón fail-silent." },
      { title: "IaC con AWS CDK", desc: "Stacks completos en TypeScript y Python: ECS Fargate, Lambda, DynamoDB, OpenSearch." },
      { title: "FinOps & eficiencia", desc: "Entornos efímeros, presupuestos con alertas y decisiones de arquitectura que evitan costes innecesarios." },
    ],
    education: {
      degree: "Ingeniería de Sistemas y Computación",
      school: "Universidad Nacional de Colombia",
      period: "2021 – 2027",
      note: "En curso · grado previsto en 2027",
    },
  },
  experience: {
    kicker: "TRAYECTORIA",
    title: "Experiencia",
    jobs: career.es,
  },
  projects: {
    kicker: "PROYECTOS",
    title: "Proyectos destacados",
    viewProject: "Ver en GitHub",
    enterpriseNote:
      "Además: plataformas de IA generativa, orquestadores multi-agente y automatización de despliegue construidos para clientes enterprise. El detalle técnico está bajo acuerdo de confidencialidad.",
    items: caseStudies("es"),
  },
  skills: {
    kicker: "STACK",
    title: "Tecnologías y dominio",
    groups: [
      { name: "Lenguajes", items: ["Python", "TypeScript", "Java"] },
      { name: "IA & LLMs", items: ["Amazon Bedrock", "Strands Agents SDK", "LangChain", "Function Calling", "Prompt Engineering", "MCP"] },
      { name: "RAG & Datos", items: ["OpenSearch", "Bedrock Knowledge Bases", "pgvector", "Ragas", "sentence-transformers", "Airflow"] },
      { name: "Backend", items: ["FastAPI", "Spring Boot", "Pydantic v2", "WebSockets", "Patrón BFF", "SQS / SNS"] },
      { name: "Cloud & IaC", items: ["AWS CDK v2", "CloudFormation", "ECS Fargate", "Lambda", "DynamoDB", "RDS", "S3 / EFS", "Kinesis", "CloudFront"] },
      { name: "DevOps & Calidad", items: ["CodePipeline / CodeBuild", "GitHub Actions", "Docker", "ECR", "Keycloak / Cognito", "OpenTelemetry", "FinOps", "pytest / Mutation testing"] },
    ],
  },
  certs: {
    kicker: "CREDENCIALES",
    title: "Certificaciones",
    prevLabel: "Anterior",
    nextLabel: "Siguiente",
    groups: [
      {
        name: "AWS · Certificaciones base",
        items: [
          { name: "AWS Certified Data Engineer Associate", issuer: "Amazon Web Services", date: "2025 – 2028" },
          { name: "AWS Certified AI Practitioner", issuer: "Amazon Web Services", date: "2025" },
          { name: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services", date: "2025" },
          { name: "AWS AI Practitioner Early Adopter", issuer: "Amazon Web Services", date: "2025" },
        ],
      },
      {
        name: "AWS · Microcredenciales Demonstrated",
        items: [
          { name: "Agentic AI Demonstrated", issuer: "AWS Training & Certification", date: "May 2026" },
          { name: "MLOps Demonstrated", issuer: "AWS Training & Certification", date: "May 2026" },
          { name: "Serverless Demonstrated", issuer: "AWS Training & Certification", date: "Jun 2026" },
          { name: "Incident Response Demonstrated", issuer: "AWS Training & Certification", date: "Jun 2026" },
        ],
      },
      {
        name: "Académicas & Vendor",
        items: [
          { name: "Diplomado en Machine Learning y Data Science", issuer: "Universidad Nacional de Colombia", date: "En curso · 2026" },
          { name: "Desarrollo Seguro (CC) COL", issuer: "Net4skills · NETEC", date: "Jul 2026" },
          { name: "Diplomado en Arquitectura y Calidad de Software", issuer: "Universidad Nacional de Colombia", date: "Jun 2026" },
          { name: "Claude with Amazon Bedrock", issuer: "Anthropic", date: "Mar 2026" },
          { name: "Applied Data Science with Python - Level 2", issuer: "IBM", date: "Nov 2025" },
          { name: "DS4A · Fundamentos en Analítica de Datos", issuer: "Correlation One", date: "2022" },
        ],
      },
    ],
  },
  contact: {
    kicker: "CONTACTO",
    title: "Tu próximo reto, una buena conversación.",
    text: "¿Un agente que necesita llegar a producción, un flujo documental o una plataforma cloud? Cuéntame el problema, el contexto y qué te gustaría lograr.",
    availability: "Bogotá / Pasto, Colombia · Colaboraciones y oportunidades remotas",
    emailLabel: "Email",
    githubLabel: "GitHub",
    linkedinLabel: "LinkedIn",
  },
  footer: {
    rights: "© 2026 Juan Carlos Andrade Unigarro",
    made: "Hecho con Next.js · GSAP · Three.js · Tailwind",
    backToTop: "Volver arriba",
  },
};

const en: typeof es = {
  nav: {
    skip: "Skip to content",
    home: "Home",
    about: "About",
    experience: "Experience",
    projects: "Projects",
    stack: "Stack",
    certifications: "Certifications",
    contact: "Contact",
  },
  hero: {
    lines: ["From an idea", "to a system", "that works."],
    intro: "I'm Juan Andrade. I connect AI agents, software engineering and cloud to bring products into production.",
    work: "Explore my work", contact: "Contact me", current: "Currently at Inetum", place: "Colombia · Let's connect",
    caption: "Connected data. Agents that act.", hint: "Activate a connection. Follow the signal.",
    stages: ["Context", "Intelligence", "Production"],
    details: ["Data, retrieval and memory: the information an agent needs to act.", "Models, tools and rules: decisions within a controlled system.", "Infrastructure, evaluation and traces: what keeps it running every day."],
    proof: ["Agents & RAG", "Document intelligence", "AWS & platforms"], scroll: "Discover how I work",
  },
  metrics: {
    items: [
      { value: 20, suffix: "+", label: "Repositories contributed to" },
      { value: 500, suffix: "+", label: "Tracked commits" },
      { value: 16, suffix: "+", label: "AI components in production" },
      { value: 8, suffix: "", label: "AWS credentials & microcredentials" },
    ],
  },
  about: {
    kicker: "ABOUT",
    title: "From models to complete systems.",
    ghost: "ABOUT",
    paragraphs: [
      "I connect AI, backend and infrastructure to build products that can be deployed, observed and maintained. I work from architecture down to the details that make a delivery reliable.",
      "Today I work in document intelligence at Inetum. Previously, at Blend360, I developed Bedrock agents, LLM observability and AWS CDK deployment platforms. My public projects explore how to bring control and evidence to software that uses AI.",
      "I study Systems and Computing Engineering at Universidad Nacional de Colombia. I work in Spanish and English (B2), with attention to quality, security and operating costs.",
    ],
    highlights: [
      { title: "AI agent architecture", desc: "Multi-agent systems with Strands Agents SDK, intent classification, tool use and MCP." },
      { title: "LLMs in production", desc: "Amazon Bedrock (Claude, Nova, Mistral), Function Calling, streaming and RAG with Knowledge Bases." },
      { title: "RAG engineering", desc: "Pipelines with OpenSearch, pgvector, reranking, persistent memory and Ragas evaluation." },
      { title: "AI observability", desc: "Distributed agent tracing (graphs, nodes, edges) on Kinesis with fail-silent design." },
      { title: "IaC with AWS CDK", desc: "Full stacks in TypeScript and Python: ECS Fargate, Lambda, DynamoDB, OpenSearch." },
      { title: "FinOps & efficiency", desc: "Ephemeral environments, budget alerts and architecture decisions that avoid unnecessary costs." },
    ],
    education: {
      degree: "Systems and Computing Engineering",
      school: "Universidad Nacional de Colombia",
      period: "2021 – 2027",
      note: "In progress · expected to graduate in 2027",
    },
  },
  experience: {
    kicker: "EXPERIENCE",
    title: "Experience",
    jobs: career.en,
  },
  projects: {
    kicker: "PROJECTS",
    title: "Featured projects",
    viewProject: "View on GitHub",
    enterpriseNote:
      "Plus: Generative AI platforms, multi-agent orchestrators and deployment automation built for enterprise clients. Technical detail is covered under NDA.",
    items: caseStudies("en"),
  },
  skills: {
    kicker: "STACK",
    title: "Technologies & expertise",
    groups: [
      { name: "Languages", items: ["Python", "TypeScript", "Java"] },
      { name: "AI & LLMs", items: ["Amazon Bedrock", "Strands Agents SDK", "LangChain", "Function Calling", "Prompt Engineering", "MCP"] },
      { name: "RAG & Data", items: ["OpenSearch", "Bedrock Knowledge Bases", "pgvector", "Ragas", "sentence-transformers", "Airflow"] },
      { name: "Backend", items: ["FastAPI", "Spring Boot", "Pydantic v2", "WebSockets", "BFF Pattern", "SQS/SNS"] },
      { name: "Cloud & IaC", items: ["AWS CDK v2", "CloudFormation", "ECS Fargate", "Lambda", "DynamoDB", "RDS", "S3 / EFS", "Kinesis", "CloudFront"] },
      { name: "DevOps & Quality", items: ["CodePipeline / CodeBuild", "GitHub Actions", "Docker", "ECR", "Keycloak / Cognito", "OpenTelemetry", "FinOps", "pytest / Mutation testing"] },
    ],
  },
  certs: {
    kicker: "CREDENTIALS",
    title: "Certifications",
    prevLabel: "Previous",
    nextLabel: "Next",
    groups: [
      {
        name: "AWS · Core certifications",
        items: [
          { name: "AWS Certified Data Engineer Associate", issuer: "Amazon Web Services", date: "2025 – 2028" },
          { name: "AWS Certified AI Practitioner", issuer: "Amazon Web Services", date: "2025" },
          { name: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services", date: "2025" },
          { name: "AWS AI Practitioner Early Adopter", issuer: "Amazon Web Services", date: "2025" },
        ],
      },
      {
        name: "AWS · Demonstrated microcredentials",
        items: [
          { name: "Agentic AI Demonstrated", issuer: "AWS Training & Certification", date: "May 2026" },
          { name: "MLOps Demonstrated", issuer: "AWS Training & Certification", date: "May 2026" },
          { name: "Serverless Demonstrated", issuer: "AWS Training & Certification", date: "Jun 2026" },
          { name: "Incident Response Demonstrated", issuer: "AWS Training & Certification", date: "Jun 2026" },
        ],
      },
      {
        name: "Academic & Vendor",
        items: [
          { name: "Machine Learning & Data Science Diploma", issuer: "Universidad Nacional de Colombia", date: "In progress · 2026" },
          { name: "Secure Development (CC) COL", issuer: "Net4skills · NETEC", date: "Jul 2026" },
          { name: "Software Architecture & Quality Diploma", issuer: "Universidad Nacional de Colombia", date: "Jun 2026" },
          { name: "Claude with Amazon Bedrock", issuer: "Anthropic", date: "Mar 2026" },
          { name: "Applied Data Science with Python - Level 2", issuer: "IBM", date: "Nov 2025" },
          { name: "DS4A · Data Analytics Fundamentals", issuer: "Correlation One", date: "2022" },
        ],
      },
    ],
  },
  contact: {
    kicker: "CONTACT",
    title: "Your next challenge starts with a conversation.",
    text: "An agent ready for production, a document workflow or a cloud platform? Tell me about the problem, the context and what you want to achieve.",
    availability: "Bogotá / Pasto, Colombia · Collaborations and remote opportunities",
    emailLabel: "Email",
    githubLabel: "GitHub",
    linkedinLabel: "LinkedIn",
  },
  footer: {
    rights: "© 2026 Juan Carlos Andrade Unigarro",
    made: "Built with Next.js · GSAP · Three.js · Tailwind",
    backToTop: "Back to top",
  },
};

export const content = { es, en };
export type Content = typeof es;
