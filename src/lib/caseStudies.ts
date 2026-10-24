/** Public repository evidence, reviewed 2026-09-07 (Ommatix, CloudPath and TryTrust: 2026-10-24). See docs/portfolio-evidence.md. */
export type ProjectCategory = "agents" | "cloud" | "tooling";
type Story = { name: string; headline: string; description: string; status: string; proof: string; details: string[]; award: string | null };
type CaseStudy = { id: string; year: string; category: ProjectCategory; tech: string[]; link: string; flow: string[]; featured?: boolean; es: Story; en: Story };

const cases: CaseStudy[] = [
  {
    id: "ommatix", year: "2026", category: "agents", featured: true,
    tech: ["Rust", "MCP", "ONNX Runtime", "UI Automation", "DXGI"],
    link: "https://github.com/Yosoyepa/Ommatix", flow: ["OBSERVE", "IDENTITY", "ACT"],
    es: {
      name: "Ommatix", headline: "Que un agente actúe sobre el control correcto, no sobre una coordenada.",
      description: "El prototipo de investigación de mi tesis: un motor local en Rust que da a los agentes de escritorio identificadores y revisiones de cada elemento, en lugar de coordenadas, y que rechaza cualquier acción sobre una observación obsoleta.",
      status: "Open source · Prototipo de investigación", proof: "Actuación fail-closed: simulación por defecto", award: null,
      details: ["Percepción incremental: analiza solo las regiones que cambian frente al último fotograma confirmado y recurre a un refresco completo cuando la geometría o el presupuesto lo exigen.", "Contrato MCP con tres herramientas (observe_screen, execute_action y get_engine_metrics); la geometría no sale del motor y cada acción exige una observación vigente.", "Evaluación preliminar con tres modelos por MCP: 0 falsos éxitos y 0 eventos de seguridad en la fase en vivo. Es una serie por modelo sobre apps sintéticas, no un ranking de modelos."],
    },
    en: {
      name: "Ommatix", headline: "An agent should act on the right control, not on a coordinate.",
      description: "The research prototype behind my thesis: a local Rust engine that gives desktop agents element IDs and revisions instead of coordinates, and refuses any action based on a stale observation.",
      status: "Open source · Research prototype", proof: "Fail-closed actuation: dry run by default", award: null,
      details: ["Incremental perception: it analyses only the regions that changed against the last committed frame and falls back to a full refresh when geometry or budgets require it.", "MCP contract with three tools (observe_screen, execute_action and get_engine_metrics); geometry stays inside the engine and every action needs a current observation.", "Preliminary evaluation with three models over MCP: 0 false successes and 0 safety events in the live phase. One series per model on synthetic apps, not a model ranking."],
    },
  },
  {
    id: "cloudpath", year: "2026", category: "agents", featured: true,
    tech: ["TypeScript", "React", "FastAPI", "Gemini Live", "Claude", "MCP"],
    link: "https://github.com/Yosoyepa/cloudpath-front", flow: ["VOICE", "ROUTE", "ADAPT"],
    es: {
      name: "CloudPath", headline: "Una entrevista por voz que se convierte en tu ruta hacia AWS.",
      description: "Copiloto de voz para preparar AWS Cloud Practitioner: entrevista al estudiante en tiempo real, detecta sus brechas y genera un mapa de aprendizaje que se recalibra tras cada microlección y explica por qué cambió con fuentes oficiales de AWS.",
      status: "Hackathon · Open source", proof: "Voz en tiempo real y una ruta que se adapta", award: "3.er puesto · Platanus Build Night 2026, Bogotá",
      details: ["Entrevista por voz con Gemini Live y token efímero de un solo uso, con consentimiento de micrófono y alternativa escrita.", "API en FastAPI desplegada en Railway: perfil, lección y adaptación con contratos versionados; planificador con Claude, respaldo con MiniMax y un generador determinista final para que la demo nunca se bloquee.", "Fuentes oficiales mediante AWS Knowledge MCP en modo solo lectura y un mapa accesible con React Flow. Frontend en cloudpath-front; la API vive en agentic-dev-hackathon-setup."],
    },
    en: {
      name: "CloudPath", headline: "A voice interview that becomes your path to AWS.",
      description: "A voice copilot for AWS Cloud Practitioner prep: it interviews the student in real time, finds their gaps and builds a learning map that recalibrates after each micro-lesson and explains why it changed with official AWS sources.",
      status: "Hackathon · Open source", proof: "Real-time voice and a path that adapts", award: "3rd place · Platanus Build Night 2026, Bogotá",
      details: ["Voice interview with Gemini Live and a single-use ephemeral token, with microphone consent and a written alternative.", "FastAPI API deployed on Railway: profile, lesson and adaptation with versioned contracts; a Claude planner, a MiniMax fallback and a final deterministic generator so the demo never stalls.", "Official sources through AWS Knowledge MCP in read-only mode and an accessible map built with React Flow. The frontend lives in cloudpath-front; the API lives in agentic-dev-hackathon-setup."],
    },
  },
  {
    id: "trytrust", year: "2026", category: "agents",
    tech: ["Python", "FastAPI", "Gemini", "MCP", "SD-JWT", "PostgreSQL"],
    link: "https://github.com/Yosoyepa/trystrus2", flow: ["SEARCH", "MANDATE", "SETTLE"],
    es: {
      name: "TryTrust", headline: "Un agente que compra por ti, pero solo con tu firma.",
      description: "Plataforma de compra agéntica con aprobación humana: el agente busca en catálogos vía MCP, propone con Gemini, valida un mandato criptográfico SD-JWT y liquida en rieles AP2 con un recibo verificable.",
      status: "Hackathon · Open source", proof: "Un mandato firmado antes de cada pago", award: "3.er puesto · NextWave Hackathon 2026 (Yuno × Nauta), sede Bogotá",
      details: ["Coordiné los cuatro carriles de desarrollo del equipo durante las 24 horas del hackatón y redacté el brief técnico de cada uno.", "Carril de fraude, contratos e idempotencia: ledger append-only encadenado por hash con raíces firmadas con KMS y outbox relay con FOR UPDATE SKIP LOCKED.", "Contratos OpenAPI, demo con cuatro consolas y pruebas agénticas contra Gemini real; al cierre se desactivó la simulación y se completó un pedido real de prueba."],
    },
    en: {
      name: "TryTrust", headline: "An agent that shops for you, but only with your signature.",
      description: "An agentic shopping platform with human approval: the agent searches catalogs over MCP, proposes with Gemini, validates an SD-JWT cryptographic mandate and settles on AP2 rails with a verifiable receipt.",
      status: "Hackathon · Open source", proof: "A signed mandate before every payment", award: "3rd place · NextWave Hackathon 2026 (Yuno × Nauta), Bogotá venue",
      details: ["I coordinated the team's four development lanes during the 24-hour hackathon and wrote the technical brief for each one.", "Fraud, contracts and idempotency lane: an append-only, hash-chained ledger with KMS-signed roots and an outbox relay with FOR UPDATE SKIP LOCKED.", "OpenAPI contracts, a demo with four consoles and agentic tests against real Gemini; at the close, simulation was switched off and a real test order was completed."],
    },
  },
  {
    id: "wct", year: "2026", category: "tooling",
    tech: ["Python", "pytest", "Mutation testing", "Ruff", "GitHub Actions"],
    link: "https://github.com/Yosoyepa/write-check-trust", flow: ["SPEC", "CHECK", "TRUST"],
    es: {
      name: "Write, Check, Trust", headline: "El código de un agente también tiene que demostrar que funciona.",
      description: "Un arnés de calidad que convierte reglas de desarrollo en controles ejecutables. Arquitectura, tests, mutación e integridad reunidos en el mismo flujo de entrega.",
      status: "Open source · Beta", proof: "Verificación antes de aceptar el cambio", award: null,
      details: ["Construí un CLI para verificar proyectos Python por niveles: feedback rápido, commit, PR y hardening.", "Los ratchets detectan retrocesos de calidad; las pruebas de mutación comprueban si los tests descubren cambios incorrectos dentro del alcance configurado.", "Las reglas se generan para distintos agentes y la integridad del arnés conserva la revisión humana. Se puede adoptar como template o integrar en un repositorio existente."],
    },
    en: {
      name: "Write, Check, Trust", headline: "An agent's code should come with evidence.",
      description: "A quality harness that turns development rules into executable checks. Architecture, tests, mutation and integrity in one delivery workflow.",
      status: "Open source · Beta", proof: "Verification before accepting a change", award: null,
      details: ["I built a CLI to verify Python projects at different tiers: fast feedback, commit, PR and hardening.", "Ratchets detect quality regressions; mutation testing checks whether tests catch incorrect changes within the configured scope.", "Rules are generated for different agents, while harness integrity retains human review. It can be adopted as a template or integrated into an existing repository."],
    },
  },
  {
    id: "assistant", year: "2026", category: "agents",
    tech: ["Python", "FastAPI", "PostgreSQL", "WhatsApp API", "Telegram", "Docker"],
    link: "https://github.com/Yosoyepa/personalAssistant", flow: ["MESSAGE", "WORKFLOW", "DELIVERY"],
    es: {
      name: "Personal Assistant", headline: "Recordatorios que sobreviven a un reinicio.",
      description: "Un asistente local para WhatsApp y Telegram: Python gobierna el estado y los permisos, el LLM participa en tareas acotadas y PostgreSQL conserva las entregas pendientes.",
      status: "Proyecto personal · Alpha", proof: "Outbox persistente + control de duplicados", award: null,
      details: ["Diseñé un runtime de workflows deterministas con memoria por usuario, aprobaciones explícitas y trazas locales.", "Un worker con SKIP LOCKED coordina entregas; los resultados ambiguos se reconcilian para evitar reenvíos ciegos. Los webhooks verifican firmas o tokens según el canal.", "La release alpha documenta 1.015 tests y 299 casos de evaluación. Su alcance actual es operación controlada por una persona; la sincronización externa de calendarios sigue pendiente."],
    },
    en: {
      name: "Personal Assistant", headline: "Reminders that survive a restart.",
      description: "A local assistant for WhatsApp and Telegram: Python owns state and permissions, the LLM handles bounded tasks, and PostgreSQL keeps pending deliveries durable.",
      status: "Personal project · Alpha", proof: "Durable outbox + duplicate control", award: null,
      details: ["I designed a deterministic workflow runtime with user-scoped memory, explicit approvals and local traces.", "A SKIP LOCKED worker coordinates delivery; ambiguous outcomes are reconciled to avoid blind retries. Webhooks verify signatures or tokens for each channel.", "The alpha release documents 1,015 tests and 299 evaluation cases. Its current scope is controlled single-operator use; external calendar synchronization is still pending."],
    },
  },
  {
    id: "oracle", year: "2026", category: "agents",
    tech: ["Amazon Bedrock", "Rekognition", "Lambda", "DynamoDB", "S3", "CDK · Python"],
    link: "https://github.com/Yosoyepa/secret-oracle-hackathon-aws", flow: ["VISION", "CLUE", "GUESS"],
    es: {
      name: "Secret Oracle", headline: "Una imagen secreta. Pistas de IA. Una idea ganadora.",
      description: "Un juego conversacional que une visión computacional y lenguaje: Rekognition interpreta la imagen y Bedrock genera pistas y evalúa los intentos, sin revelar el secreto al navegador.",
      status: "Hackathon · Demo funcional", proof: "Del concepto al juego desplegable con CDK", award: "Equipo ganador · AWS Community Day Colombia",
      details: ["Construido en equipo durante la hackathon, con una única Lambda para la API y el frontend.", "DynamoDB conserva el estado oculto y S3 la imagen temporal; el secreto solo se revela al terminar la partida.", "Infraestructura en CDK Python, permisos IAM acotados, TTL y controles FinOps pensados para una demo de duración limitada."],
    },
    en: {
      name: "Secret Oracle", headline: "A secret image. AI clues. A winning idea.",
      description: "A conversational game combining vision and language: Rekognition interprets the image, while Bedrock generates clues and judges guesses without sending the secret to the browser.",
      status: "Hackathon · Working demo", proof: "From concept to a game deployable with CDK", award: "Winning team · AWS Community Day Colombia",
      details: ["Built with a team during the hackathon, using a single Lambda for the API and frontend.", "DynamoDB holds the hidden game state and S3 the temporary image; the secret is revealed only when the game ends.", "Python CDK infrastructure, scoped IAM permissions, TTL and FinOps controls designed for a time-limited demo."],
    },
  },
  {
    id: "rag", year: "2026", category: "agents",
    tech: ["FastAPI", "pgvector · HNSW", "sentence-transformers", "Streamlit", "Docker"],
    link: "https://github.com/Yosoyepa/bbva-colombia-rag-assistant", flow: ["INGEST", "RETRIEVE", "CITE"],
    es: {
      name: "RAG sobre información pública", headline: "Respuestas que permiten volver a la fuente.",
      description: "Un pipeline completo de consulta documental: ingesta web, embeddings locales, recuperación en pgvector y conversación con fuentes, memoria por sesión y trazas de latencia.",
      status: "Prueba técnica · Demo", proof: "Ingesta → retrieval → respuesta con fuentes", award: null,
      details: ["Construí el ciclo de ingesta y consulta sobre páginas públicas de BBVA Colombia como prueba técnica independiente; no es un producto oficial del banco.", "Embeddings de 384 dimensiones en CPU, índice HNSW, reranker Cross-Encoder opcional y fallback entre proveedores de LLM.", "FastAPI separa el backend de Streamlit; PostgreSQL conserva sesiones e historial. Docker Compose reúne base de datos, API e interfaz."],
    },
    en: {
      name: "RAG over public information", headline: "Answers you can trace back to the source.",
      description: "An end-to-end retrieval pipeline: web ingestion, local embeddings, pgvector search and conversation with sources, session memory and latency traces.",
      status: "Technical exercise · Demo", proof: "Ingest → retrieve → answer with sources", award: null,
      details: ["I built ingestion and retrieval over public BBVA Colombia pages as an independent technical exercise; this is not an official bank product.", "384-dimensional CPU embeddings, an HNSW index, optional Cross-Encoder reranking and LLM provider fallback.", "FastAPI separates the backend from Streamlit; PostgreSQL persists sessions and history. Docker Compose brings together the database, API and interface."],
    },
  },
  {
    id: "biostock", year: "2026", category: "cloud",
    tech: ["AWS CDK", "Python", "ECS", "SNS / SQS", "RDS", "CloudFront"],
    link: "https://github.com/Yosoyepa/BioStock-Systems-Infra", flow: ["EVENT", "QUEUE", "SERVICE"],
    es: {
      name: "BioStock Cloud Infra", headline: "Seis microservicios. Una infraestructura reproducible.",
      description: "Infraestructura e-commerce organizada en cinco stacks CDK: red, datos, mensajería, cómputo y CDN. Los servicios se comunican mediante eventos con SNS y SQS.",
      status: "Proyecto académico · IaC", proof: "5 stacks modulares · 6 microservicios", award: null,
      details: ["Diseñé la infraestructura modular en AWS CDK Python, con dependencias explícitas entre stacks y permisos por servicio.", "ECS sobre EC2, RDS y DynamoDB, fan-out SNS/SQS y frontend en S3 + CloudFront con Origin Access Control.", "Optimicé la topología para entornos efímeros de desarrollo y demos: red sin NAT Gateway, presupuestos y un ciclo de despliegue y retirada de recursos definido."],
    },
    en: {
      name: "BioStock Cloud Infra", headline: "Six microservices. Reproducible infrastructure.",
      description: "E-commerce infrastructure in five CDK stacks: networking, data, messaging, compute and CDN. Services communicate through SNS and SQS events.",
      status: "Academic project · IaC", proof: "5 modular stacks · 6 microservices", award: null,
      details: ["I designed modular AWS CDK infrastructure in Python, with explicit stack dependencies and per-service permissions.", "ECS on EC2, RDS and DynamoDB, SNS/SQS fan-out, and an S3 + CloudFront frontend with Origin Access Control.", "I optimized the topology for ephemeral development environments and demos: networking without NAT Gateways, budgets and a defined deployment and teardown cycle."],
    },
  },
  {
    id: "codeguard", year: "2025", category: "tooling",
    tech: ["FastAPI", "AST · Bandit", "Gemini", "MCP", "WebSockets", "PostgreSQL"],
    link: "https://github.com/Yosoyepa/CodeGuardAI", flow: ["CODE", "ANALYZE", "EXPLAIN"],
    es: {
      name: "CodeGuardAI", headline: "De un hallazgo de código a una explicación útil.",
      description: "Revisión de Python con agentes de seguridad, calidad, rendimiento y estilo. Análisis estático, orquestación paralela y explicaciones con Gemini, con progreso en tiempo real.",
      status: "Proyecto colaborativo · Open source", proof: "Análisis especializado + feedback por WebSocket", award: null,
      details: ["Contribuí a una plataforma de revisión con FastAPI y separación de capas, persistencia en PostgreSQL y eventos para comunicar el progreso.", "El orquestador reúne agentes especializados; AST, Bandit, Pylint y Radon aportan hallazgos que el adaptador de Gemini puede explicar.", "Clientes MCP enriquecen el contexto de las explicaciones. La integración entre agentes y las actualizaciones por WebSocket cuentan con pruebas específicas."],
    },
    en: {
      name: "CodeGuardAI", headline: "From a code finding to a useful explanation.",
      description: "Python reviews with security, quality, performance and style agents. Static analysis, parallel orchestration and Gemini explanations, with live progress updates.",
      status: "Collaborative project · Open source", proof: "Specialized analysis + WebSocket feedback", award: null,
      details: ["I contributed to a review platform with FastAPI and separated layers, PostgreSQL persistence and progress events.", "The orchestrator combines specialized agents; AST, Bandit, Pylint and Radon produce findings that the Gemini adapter can explain.", "MCP clients enrich the context for explanations. Agent integration and WebSocket progress updates have dedicated tests."],
    },
  },
];

export function caseStudies(lang: "es" | "en") {
  return cases.map(({ es, en, ...shared }) => ({ ...shared, ...(lang === "es" ? es : en) }));
}
