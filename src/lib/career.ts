const career = {
  es: [
    {
      company: "Inetum Colombia S.A.S", role: "Senior AI Engineer", period: "Jul 2026 – Presente", location: "Bogotá · Híbrido", current: true,
      headline: "Convertir documentos en información confiable.",
      summary: "Trabajo en inteligencia documental: llevar información de un PDF a una decisión requiere extracción consistente, trazabilidad y control sobre cuándo interviene un modelo.",
      impact: "Inteligencia documental con control y trazabilidad",
      stack: ["Python", "OCR", "Arquitectura hexagonal", "SLM on-premise", "Gobernanza de datos"],
      bullets: [
        "Desarrollo plataformas de inteligencia documental (IDP) que combinan extracción determinista con OCR y validación de la información obtenida.",
        "Aplico arquitectura hexagonal y evaluación por casos para que cada cambio en la extracción pueda revisarse y probarse.",
        "Integro modelos de lenguaje pequeños (SLM) en entornos locales como fallback controlado, junto con revisión humana y gobernanza de datos.",
        "Conecto la entrega de IA con prácticas de operación segura e incident response, respaldadas por experiencia cloud y la microcredencial AWS Incident Response Demonstrated.",
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
      headline: "Turning documents into trustworthy information.",
      summary: "I work in document intelligence: moving information from a PDF to a decision requires consistent extraction, traceability and control over when a model gets involved.",
      impact: "Document intelligence with control and traceability",
      stack: ["Python", "OCR", "Hexagonal architecture", "On-premise SLMs", "Data governance"],
      bullets: [
        "I develop intelligent document processing (IDP) platforms that combine deterministic extraction, OCR and validation of the extracted information.",
        "I apply hexagonal architecture and case-based evaluation so every extraction change can be reviewed and tested.",
        "I integrate small language models (SLMs) in local environments as a controlled fallback, alongside human review and data governance.",
        "I connect AI delivery with secure operations and incident response, supported by cloud experience and the AWS Incident Response Demonstrated microcredential.",
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
