/**
 * Contenido bilingüe (ES/EN) del portafolio de Juan Carlos Andrade Unigarro.
 * Editar este archivo para actualizar textos; ambas variantes deben tener la misma forma.
 * Convención tipográfica: sin em-dashes; rangos con – y separadores con ·
 */

export type Lang = "es" | "en";

// ─────────────────────────────────────────────────────────────────────────────
// Datos de contacto — TODO: reemplaza los placeholders con tus datos reales.
// ─────────────────────────────────────────────────────────────────────────────
export const GITHUB_URL = "https://github.com/Yosoyepa";
export const EMAIL = "tu.correo@ejemplo.com"; // TODO: tu correo real
export const LINKEDIN_URL = "https://www.linkedin.com/in/tu-usuario"; // TODO: tu usuario real

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
    kicker: "Senior AI Engineer · Bogotá / Pasto, Colombia",
    firstName: "Juan",
    lastName: "Andrade",
    roles: [
      "IA generativa en producción",
      "Arquitectura de agentes sobre AWS",
      "LLMOps y observabilidad",
      "Cloud serverless & FinOps",
    ],
    tagline:
      "Diseño sistemas agénticos de IA generativa y la infraestructura AWS serverless que los lleva a producción.",
    ctaPrimary: "Ver proyectos",
    ctaSecondary: "Contactarme",
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
    title: "Ingeniero híbrido: IA generativa + Cloud",
    ghost: "PERFIL",
    paragraphs: [
      "No soy un científico de datos que deja scripts sueltos, ni un DevOps que solo levanta servidores: soy ingeniero de software. Aplico patrones estrictos (Clean Architecture, Hexagonal, SOLID) para construir plataformas de IA resilientes, observables, seguras y listas para el nivel enterprise.",
      "Actualmente soy Senior AI Engineer en Inetum Colombia. Antes, en Blend360 LATAM, pasé del programa de semillero al equipo core de producto en solo dos meses, donde llevé sistemas multi-agente sobre Amazon Bedrock a producción junto con pipelines de observabilidad para LLMs y despliegues serverless con AWS CDK.",
      "Estudio Ingeniería de Sistemas y Computación en la Universidad Nacional de Colombia, tengo inglés profesional (B2) y una obsesión clara: convertir requisitos complejos en arquitecturas escalables y eficientes en costo.",
    ],
    highlights: [
      { title: "Arquitectura de agentes IA", desc: "Sistemas multi-agente con Strands Agents SDK, clasificación de intención, tool use y MCP." },
      { title: "LLM en producción", desc: "Amazon Bedrock (Claude, Nova, Mistral), Function Calling, streaming y RAG con Knowledge Bases." },
      { title: "RAG engineering", desc: "Pipelines con OpenSearch, pgvector, reranking, memoria persistente y evaluación con Ragas." },
      { title: "Observabilidad de IA", desc: "Trazabilidad distribuida de agentes (grafos, nodos, edges) con Kinesis y patrón fail-silent." },
      { title: "IaC con AWS CDK", desc: "Stacks completos en TypeScript y Python: ECS Fargate, Lambda, DynamoDB, OpenSearch." },
      { title: "FinOps & zero-cost", desc: "Topologías Free Tier sin NAT Gateway, presupuestos con alertas y arquitectura de coste cero." },
    ],
    education: {
      degree: "Ingeniería de Sistemas y Computación",
      school: "Universidad Nacional de Colombia",
      period: "2021 – 2027",
      note: "En curso, etapas finales",
    },
  },
  experience: {
    kicker: "TRAYECTORIA",
    title: "Experiencia",
    jobs: [
      {
        company: "Inetum Colombia S.A.S",
        role: "Senior AI Engineer · Especialista Técnico Senior",
        period: "Jul 2026 – Presente",
        location: "Bogotá · Híbrido",
        current: true,
        bullets: [
          "Soluciones enterprise de IA aplicada, cloud y sistemas distribuidos dentro de programas de transformación digital.",
          "Operación con mentalidad de seguridad e incident response, complementada con la microcredencial AWS Incident Response Demonstrated.",
          "Arquitectura y entrega técnica en iniciativas Data & AI para clientes corporativos.",
        ],
      },
      {
        company: "Blend360 LATAM",
        role: "Cloud & AI Engineer · Backend Engineer (equipo core de producto)",
        period: "Mar 2025 – Jun 2026",
        location: "Bogotá · Híbrido",
        current: false,
        bullets: [
          "Promovido al equipo core de producto a solo 2 meses de ingresar al programa de semillero.",
          "Integré la observabilidad de agentes (trazas distribuidas con Kinesis/DynamoDB/S3, patrón fail-silent) en una plataforma GenAI basada en LangChain, sin modificar su núcleo.",
          "Refactoricé el orquestador multi-agente: clasificador de intención con Strands Agents SDK + chain-of-thought y trazas padre-hijo deterministas.",
          "Construí una librería hexagonal de extracción PDF→JSON con Bedrock Function Calling: chunking adaptativo, concurrencia async y tracking de costos por modelo.",
          "Desarrollé en solitario la plataforma Apache Airflow 3 sobre ECS Fargate (5 servicios ECS) con infraestructura CDK, Keycloak OIDC y autoscaling.",
          "Contribuidor #1 del instalador que provisiona automáticamente 16+ componentes de IA en cuentas AWS de clientes (156 commits).",
          "Capacitador técnico interno del equipo de producto (chatbot RAG) y miembro del equipo en el bootcamp AWS GenAI Ignite en las oficinas de AWS Bogotá.",
        ],
      },
      {
        company: "Blend360 LATAM",
        role: "Data Analyst Trainee · Programa semillero All-Star",
        period: "Dic 2024 – Mar 2025",
        location: "Bogotá",
        current: false,
        bullets: [
          "Ingreso por el programa de semillero; promoción temprana validada por los directores de Arquitectura y de AWS Practice.",
        ],
      },
    ],
  },
  projects: {
    kicker: "PROYECTOS",
    title: "Proyectos destacados",
    viewProject: "Ver en GitHub",
    enterpriseNote:
      "Además: plataformas de IA generativa, orquestadores multi-agente y automatización de despliegue construidos para clientes enterprise. El detalle técnico está bajo acuerdo de confidencialidad.",
    items: [
      {
        name: "Secret Oracle",
        year: "2026",
        award: "Ganador · Hackathon AWS Community Day Colombia",
        description:
          "Juego conversacional serverless donde una IA guarda una imagen secreta, entrega pistas crípticas generadas con Amazon Bedrock y valida los intentos del jugador con visión computacional.",
        tech: ["AWS Lambda", "Bedrock", "Rekognition", "DynamoDB", "S3", "CDK (Python)", "FinOps"],
        link: "https://github.com/Yosoyepa",
      },
      {
        name: "BioStock Cloud Infra",
        year: "2026",
        award: null,
        description:
          "Arquitectura e-commerce event-driven de coste cero: 6 microservicios definidos con AWS CDK en Python, stacks DDD modulares, fan-out SNS + SQS y topología 100% Free Tier sin NAT Gateway.",
        tech: ["AWS CDK", "Event-Driven", "ECS", "Lambda", "SNS/SQS", "IAM/SSO", "Budgets"],
        link: "https://github.com/Yosoyepa/BioStock-Systems-Infra",
      },
      {
        name: "CodeGuardAI",
        year: "2025",
        award: null,
        description:
          "Sistema multi-agente de revisión de código Python con LLMs: análisis de seguridad, calidad y performance sobre FastAPI + Clean Architecture, WebSockets en tiempo real y servidores MCP.",
        tech: ["FastAPI", "Clean Architecture", "Gemini", "MCP", "WebSockets", "Docker", "PostgreSQL"],
        link: "https://github.com/Yosoyepa/CodeGuardAI",
      },
    ],
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
      { name: "DevOps & Calidad", items: ["CodePipeline / CodeBuild", "GitHub Actions", "Docker", "ECR", "Keycloak / Cognito", "OpenTelemetry", "FinOps", "Tests > 94%"] },
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
          { name: "AWS Certified AI Practitioner + Early Adopter", issuer: "Amazon Web Services", date: "2025" },
          { name: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services", date: "2025" },
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
    title: "Construyamos algo memorable.",
    text: "Abierto a colaboraciones, roles senior de IA aplicada y retos cloud-native. Respondo rápido y trabajo en español o inglés.",
    availability: "Disponible · Bogotá (híbrido/presencial) · Remoto global",
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
    kicker: "Senior AI Engineer · Bogotá / Pasto, Colombia",
    firstName: "Juan",
    lastName: "Andrade",
    roles: [
      "Production Generative AI",
      "Agentic architectures on AWS",
      "LLMOps & observability",
      "Serverless cloud & FinOps",
    ],
    tagline:
      "I design agentic Generative AI systems and the AWS serverless infrastructure that ships them to production.",
    ctaPrimary: "View projects",
    ctaSecondary: "Get in touch",
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
    title: "Hybrid engineer: Generative AI + Cloud",
    ghost: "ABOUT",
    paragraphs: [
      "I'm not a data scientist leaving loose scripts behind, nor a DevOps who only spins up servers: I'm a software engineer. I apply strict patterns (Clean Architecture, Hexagonal, SOLID) to build AI platforms that are resilient, observable, secure and ready for the enterprise level.",
      "Today I'm a Senior AI Engineer at Inetum Colombia. Before that, at Blend360 LATAM, I went from the seed program to the core product team in just two months, taking multi-agent systems on Amazon Bedrock to production along with LLM observability pipelines and serverless deployments with AWS CDK.",
      "I'm studying Systems and Computing Engineering at Universidad Nacional de Colombia, I have professional English (B2), and one clear obsession: turning complex requirements into scalable, cost-efficient architectures.",
    ],
    highlights: [
      { title: "AI agent architecture", desc: "Multi-agent systems with Strands Agents SDK, intent classification, tool use and MCP." },
      { title: "LLMs in production", desc: "Amazon Bedrock (Claude, Nova, Mistral), Function Calling, streaming and RAG with Knowledge Bases." },
      { title: "RAG engineering", desc: "Pipelines with OpenSearch, pgvector, reranking, persistent memory and Ragas evaluation." },
      { title: "AI observability", desc: "Distributed agent tracing (graphs, nodes, edges) on Kinesis with fail-silent design." },
      { title: "IaC with AWS CDK", desc: "Full stacks in TypeScript and Python: ECS Fargate, Lambda, DynamoDB, OpenSearch." },
      { title: "FinOps & zero-cost", desc: "Free Tier topologies without NAT Gateway, budget alerts and zero-idle-cost architecture." },
    ],
    education: {
      degree: "Systems and Computing Engineering",
      school: "Universidad Nacional de Colombia",
      period: "2021 – 2027",
      note: "In progress, final stages",
    },
  },
  experience: {
    kicker: "EXPERIENCE",
    title: "Experience",
    jobs: [
      {
        company: "Inetum Colombia S.A.S",
        role: "Senior AI Engineer · Senior Technical Specialist",
        period: "Jul 2026 – Present",
        location: "Bogotá · Hybrid",
        current: true,
        bullets: [
          "Enterprise applied-AI, cloud and distributed systems solutions within digital transformation programs.",
          "Operating with a security-first, incident-response mindset backed by the AWS Incident Response Demonstrated microcredential.",
          "Architecture and technical delivery in Data & AI initiatives for corporate clients.",
        ],
      },
      {
        company: "Blend360 LATAM",
        role: "Cloud & AI Engineer · Backend Engineer (core product team)",
        period: "Mar 2025 – Jun 2026",
        location: "Bogotá · Hybrid",
        current: false,
        bullets: [
          "Promoted to the core product team only 2 months after joining the seed program.",
          "Integrated agent observability (distributed tracing on Kinesis/DynamoDB/S3, fail-silent pattern) into a LangChain-based GenAI platform without touching its core.",
          "Refactored the multi-agent orchestrator: intent classifier with Strands Agents SDK + chain-of-thought and deterministic parent-child traces.",
          "Built a hexagonal PDF→JSON extraction library on Bedrock Function Calling: adaptive chunking, async concurrency and per-model cost tracking.",
          "Single-handedly developed the Apache Airflow 3 platform on ECS Fargate (5 ECS services) with CDK infrastructure, Keycloak OIDC and autoscaling.",
          "#1 contributor of the installer that automatically provisions 16+ AI components into client AWS accounts (156 commits).",
          "Internal technical trainer for the product team (RAG chatbot) and Blend360 team member at the AWS GenAI Ignite bootcamp held at AWS Bogotá offices.",
        ],
      },
      {
        company: "Blend360 LATAM",
        role: "Data Analyst Trainee · All-Star seed program",
        period: "Dec 2024 – Mar 2025",
        location: "Bogotá",
        current: false,
        bullets: [
          "Joined through the seed program; early promotion validated by the Directors of Architecture and AWS Practice.",
        ],
      },
    ],
  },
  projects: {
    kicker: "PROJECTS",
    title: "Featured projects",
    viewProject: "View on GitHub",
    enterpriseNote:
      "Plus: Generative AI platforms, multi-agent orchestrators and deployment automation built for enterprise clients. Technical detail is covered under NDA.",
    items: [
      {
        name: "Secret Oracle",
        year: "2026",
        award: "Winner · AWS Community Day Colombia Hackathon",
        description:
          "Serverless conversational game where an AI keeps a secret image, hands out cryptic clues generated with Amazon Bedrock and validates player guesses with computer vision.",
        tech: ["AWS Lambda", "Bedrock", "Rekognition", "DynamoDB", "S3", "CDK (Python)", "FinOps"],
        link: "https://github.com/Yosoyepa",
      },
      {
        name: "BioStock Cloud Infra",
        year: "2026",
        award: null,
        description:
          "Zero-cost event-driven e-commerce architecture: 6 microservices defined with AWS CDK in Python, modular DDD stacks, SNS + SQS fan-out and a 100% Free Tier topology without NAT Gateway.",
        tech: ["AWS CDK", "Event-Driven", "ECS", "Lambda", "SNS/SQS", "IAM/SSO", "Budgets"],
        link: "https://github.com/Yosoyepa/BioStock-Systems-Infra",
      },
      {
        name: "CodeGuardAI",
        year: "2025",
        award: null,
        description:
          "Multi-agent code review system for Python using LLMs: security, quality and performance analysis on FastAPI + Clean Architecture, real-time WebSockets and MCP servers.",
        tech: ["FastAPI", "Clean Architecture", "Gemini", "MCP", "WebSockets", "Docker", "PostgreSQL"],
        link: "https://github.com/Yosoyepa/CodeGuardAI",
      },
    ],
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
      { name: "DevOps & Quality", items: ["CodePipeline / CodeBuild", "GitHub Actions", "Docker", "ECR", "Keycloak / Cognito", "OpenTelemetry", "FinOps", "Tests > 94%"] },
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
          { name: "AWS Certified AI Practitioner + Early Adopter", issuer: "Amazon Web Services", date: "2025" },
          { name: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services", date: "2025" },
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
    title: "Let's build something memorable.",
    text: "Open to collaborations, senior applied-AI roles and cloud-native challenges. I reply fast and work in Spanish or English.",
    availability: "Available · Bogotá (hybrid/on-site) · Global remote",
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
