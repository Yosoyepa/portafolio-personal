const career = {
  es: [
    {
      company: "Inetum Colombia S.A.S", role: "Senior AI Engineer", period: "Jul 2026 – Presente", location: "Bogotá · Híbrido", current: true,
      headline: "Documentos que se convierten en datos con evidencia.",
      summary: "Desarrollo una plataforma de inteligencia documental para el onboarding crediticio de un cliente del sector financiero: un extractor determinista, expuesto como API, que clasifica cada documento, lo lee con OCR local y devuelve cada campo con su evidencia, o se abstiene cuando no hay certeza. La versión más avanzada está en pruebas con el cliente.",
      impact: "Cada dato extraído llega con evidencia o con una abstención explícita",
      stack: ["Python", "FastAPI", "RabbitMQ", "PostgreSQL", "ONNX Runtime", "OpenShift", "Argo CD"],
      bullets: [
        "Replanteé el alcance del sistema heredado: un motor que podía aprobar documentos por su cuenta pasó a ser un extractor determinista que solo entrega datos con evidencia; la decisión final queda en la aplicación del cliente.",
        "Diseñé la clasificación por perfiles documentales parametrizados en base de datos y la resolución de cada campo con puntuación y confianza calibrada. Ante la duda, el sistema responde LOW_CONFIDENCE o NOT_FOUND en lugar de inventar un valor.",
        "OCR local con varios motores (RapidOCR sobre ONNX y Tesseract) y un modelo de lenguaje pequeño on-premise preparado como respaldo controlado, desactivado por defecto y con revisión humana: ningún documento sale a una API externa.",
        "Arquitectura hexagonal verificada de forma automática (import-linter y pruebas de arquitectura), idempotencia por huella, outbox transaccional y mensajería con RabbitMQ sobre AMQPS con mTLS.",
        "Entrega guiada por evidencia: ADRs, gates de calidad, modo sombra y canary con kill switches que fallan en cerrado; análisis estático llevado a cero hallazgos y 95 % de cobertura en la API.",
        "Despliegue en OpenShift con Kustomize y Argo CD, imágenes revisadas con Trivy y Hadolint, y desarrollo asistido por agentes de IA con instrucciones versionadas y un servidor MCP de OCR local.",
      ],
    },
    {
      company: "Blend360 LATAM", role: "Cloud & AI Engineer · Backend Engineer", period: "Mar 2025 – Jun 2026", location: "Bogotá · Híbrido", current: false,
      headline: "Del agente de IA a la plataforma que lo opera.",
      summary: "En el equipo core de producto conecté tres piezas del mismo problema: agentes útiles, visibilidad de sus ejecuciones y despliegues repetibles en AWS. Mi alcance fue desde el backend hasta la infraestructura.",
      impact: "16+ componentes de IA con aprovisionamiento automatizado",
      stack: ["Bedrock", "Strands Agents SDK", "AWS CDK", "ECS Fargate", "Kinesis", "Airflow"],
      bullets: [
        "Refactoricé la orquestación multi-agente con Strands Agents SDK, clasificación de intención y trazas padre-hijo para seguir cada ejecución.",
        "Integré observabilidad distribuida en una plataforma LangChain sin cambiar su núcleo: Kinesis, DynamoDB y S3, con fallos de telemetría que no interrumpen al usuario.",
        "Construí una librería de extracción PDF → JSON con Bedrock Function Calling, chunking adaptativo, concurrencia asíncrona, validación y seguimiento de costes por modelo.",
        "Desarrollé la plataforma Apache Airflow 3 sobre cinco servicios ECS Fargate, con CDK, Keycloak OIDC y autoscaling.",
        "Fui el contribuidor #1 del instalador de 16+ componentes de IA en cuentas AWS de clientes, con 156 commits registrados. Trabajé también en pipelines CodePipeline/CodeBuild y librerías CDK reutilizables.",
        "Construí backends y capas BFF con FastAPI y Java/Spring Boot; capacité a nuevos integrantes en chatbot RAG y participé en AWS GenAI Ignite en Bogotá.",
      ],
    },
    {
      company: "Blend360 LATAM", role: "Data Analyst Trainee · All-Star", period: "Dic 2024 – Mar 2025", location: "Bogotá", current: false,
      headline: "Una base de software que abrió paso al equipo de producto.",
      summary: "Ingresé por el programa All-Star. La combinación de aprendizaje y ejecución técnica me llevó del semillero al equipo core de producto durante mis primeros meses.",
      impact: "Promoción al equipo de producto en 2–3 meses",
      stack: ["Python", "Ingeniería de software", "AWS", "Analítica de datos"],
      bullets: [
        "Ingresé al programa de formación All-Star y fui promovido al equipo core de producto en aproximadamente 2–3 meses.",
        "La transición, validada por los líderes de Arquitectura y AWS Practice, marcó el inicio de mi trabajo en plataformas cloud e IA generativa.",
      ],
    },
  ],
  en: [
    {
      company: "Inetum Colombia S.A.S", role: "Senior AI Engineer", period: "Jul 2026 – Present", location: "Bogotá · Hybrid", current: true,
      headline: "Documents turned into data with evidence.",
      summary: "I build a document intelligence platform for credit onboarding at a financial-sector client: a deterministic extractor, exposed as an API, that classifies each document, reads it with local OCR and returns every field with its evidence, or abstains when it is not certain. The most advanced version is in testing with the client.",
      impact: "Every extracted value comes with evidence or an explicit abstention",
      stack: ["Python", "FastAPI", "RabbitMQ", "PostgreSQL", "ONNX Runtime", "OpenShift", "Argo CD"],
      bullets: [
        "I reframed the scope of the legacy system: an engine that could approve documents on its own became a deterministic extractor that only delivers data with evidence; the final decision stays in the client's application.",
        "I designed classification by document profiles parameterized in the database, and resolution of each field with scoring and calibrated confidence. When in doubt, the system answers LOW_CONFIDENCE or NOT_FOUND instead of inventing a value.",
        "Local OCR with several engines (RapidOCR on ONNX and Tesseract) and a small on-premise language model ready as a controlled fallback, disabled by default and with human review: no document leaves for an external API.",
        "Hexagonal architecture verified automatically (import-linter and architecture tests), fingerprint-based idempotency, a transactional outbox and RabbitMQ messaging over AMQPS with mTLS.",
        "Evidence-driven delivery: ADRs, quality gates, shadow mode and canary releases with fail-closed kill switches; static analysis brought to zero findings and 95% coverage on the API.",
        "Deployment on OpenShift with Kustomize and Argo CD, images checked with Trivy and Hadolint, and development assisted by AI agents with versioned instructions and a local OCR MCP server.",
      ],
    },
    {
      company: "Blend360 LATAM", role: "Cloud & AI Engineer · Backend Engineer", period: "Mar 2025 – Jun 2026", location: "Bogotá · Hybrid", current: false,
      headline: "From the AI agent to the platform that runs it.",
      summary: "On the core product team I connected three parts of the same problem: useful agents, visibility into their runs, and repeatable AWS deployments. My work spanned backend and infrastructure.",
      impact: "16+ AI components with automated provisioning",
      stack: ["Bedrock", "Strands Agents SDK", "AWS CDK", "ECS Fargate", "Kinesis", "Airflow"],
      bullets: [
        "I refactored multi-agent orchestration with Strands Agents SDK, intent classification and parent-child traces to follow each execution.",
        "I integrated distributed observability into a LangChain platform without changing its core: Kinesis, DynamoDB and S3, with telemetry failures isolated from the user experience.",
        "I built a PDF → JSON extraction library with Bedrock Function Calling, adaptive chunking, asynchronous concurrency, validation and per-model cost tracking.",
        "I developed an Apache Airflow 3 platform across five ECS Fargate services, with CDK, Keycloak OIDC and autoscaling.",
        "I was the #1 contributor to the installer for 16+ AI components in customer AWS accounts, with 156 recorded commits. I also worked on CodePipeline/CodeBuild pipelines and reusable CDK libraries.",
        "I built backends and BFF layers with FastAPI and Java/Spring Boot, trained new teammates in chatbot RAG and joined AWS GenAI Ignite in Bogotá.",
      ],
    },
    {
      company: "Blend360 LATAM", role: "Data Analyst Trainee · All-Star", period: "Dec 2024 – Mar 2025", location: "Bogotá", current: false,
      headline: "Software foundations that opened the door to product engineering.",
      summary: "I joined through the All-Star program. Learning and technical delivery took me from the training program to the core product team within my first months.",
      impact: "Promoted to the product team in 2–3 months",
      stack: ["Python", "Software engineering", "AWS", "Data analytics"],
      bullets: [
        "I joined the All-Star training program and was promoted to the core product team in approximately 2–3 months.",
        "The transition, validated by Architecture and AWS Practice leaders, marked the start of my work on cloud and generative AI platforms.",
      ],
    },
  ],
};

export default career;
