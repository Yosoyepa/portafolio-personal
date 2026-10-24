import {
  siApacheairflow,
  siArgo,
  siClaude,
  siDocker,
  siFastapi,
  siGithubactions,
  siGooglegemini,
  siKeycloak,
  siLangchain,
  siModelcontextprotocol,
  siOnnx,
  siOpenjdk,
  siOpensearch,
  siOpentelemetry,
  siPostgresql,
  siPydantic,
  siPytest,
  siPython,
  siRabbitmq,
  siReact,
  siRedhatopenshift,
  siRuff,
  siRust,
  siSpringboot,
  siStreamlit,
  siTelegram,
  siTypescript,
  siWhatsapp,
  type SimpleIcon,
} from "simple-icons";

/**
 * Logos de tecnologías para Marquee, Stack, Proyectos y Experiencia.
 * - "si": Simple Icons (datos CC0; cada marca pertenece a su dueño). Solo named exports para que el tree-shaking
 *   deje fuera el resto del paquete.
 * - "aws": AWS Architecture Icons oficiales (paquete 07312026), copiados a public/brand/aws/.
 * Fuentes y condiciones de uso: docs/visual-assets.md.
 */
export type BrandIconData =
  | { kind: "si"; title: string; hex: string; path: string }
  | { kind: "aws"; title: string; src: string };

const si = ({ title, hex, path }: SimpleIcon): BrandIconData => ({ kind: "si", title, hex: `#${hex}`, path });
const aws = (title: string, slug: string): BrandIconData => ({ kind: "aws", title, src: `/brand/aws/${slug}.svg` });

const BEDROCK = aws("Amazon Bedrock", "bedrock");
const CDK = aws("AWS Cloud Development Kit", "cdk");
const FARGATE = aws("AWS Fargate", "fargate");

/** Nombre normalizado (ver `normalize`) → logo. Las etiquetas compuestas se resuelven por segmentos. */
export const BRAND_ICONS: Readonly<Record<string, BrandIconData>> = {
  // Lenguajes y frameworks
  python: si(siPython),
  typescript: si(siTypescript),
  java: si(siOpenjdk), // Simple Icons no publica el logo de Java (Oracle); OpenJDK es la implementación de referencia.
  rust: si(siRust),
  fastapi: si(siFastapi),
  react: si(siReact),
  "spring boot": si(siSpringboot),
  pydantic: si(siPydantic),
  streamlit: si(siStreamlit),
  // IA
  langchain: si(siLangchain),
  mcp: si(siModelcontextprotocol),
  gemini: si(siGooglegemini),
  "gemini live": si(siGooglegemini),
  claude: si(siClaude),
  "onnx runtime": si(siOnnx),
  // Datos
  opensearch: si(siOpensearch),
  airflow: si(siApacheairflow),
  postgresql: si(siPostgresql),
  // DevOps y calidad
  docker: si(siDocker),
  "github actions": si(siGithubactions),
  keycloak: si(siKeycloak),
  opentelemetry: si(siOpentelemetry),
  openshift: si(siRedhatopenshift),
  "argo cd": si(siArgo),
  pytest: si(siPytest),
  ruff: si(siRuff),
  // Mensajería
  "whatsapp api": si(siWhatsapp),
  telegram: si(siTelegram),
  rabbitmq: si(siRabbitmq),
  // AWS
  aws: aws("Amazon Web Services", "aws"),
  "amazon bedrock": BEDROCK,
  bedrock: BEDROCK,
  "bedrock knowledge bases": BEDROCK,
  rekognition: aws("Amazon Rekognition", "rekognition"),
  "aws cdk": CDK,
  cdk: CDK,
  cloudformation: aws("AWS CloudFormation", "cloudformation"),
  "ecs fargate": FARGATE,
  ecs: aws("Amazon Elastic Container Service", "ecs"),
  ecr: aws("Amazon Elastic Container Registry", "ecr"),
  lambda: aws("AWS Lambda", "lambda"),
  dynamodb: aws("Amazon DynamoDB", "dynamodb"),
  rds: aws("Amazon RDS", "rds"),
  s3: aws("Amazon S3", "s3"),
  kinesis: aws("Amazon Kinesis", "kinesis"),
  sqs: aws("Amazon SQS", "sqs"),
  sns: aws("Amazon SNS", "sns"),
  cloudfront: aws("Amazon CloudFront", "cloudfront"),
  codepipeline: aws("AWS CodePipeline", "codepipeline"),
};

/** Minúsculas, sin tildes, sin sufijo de versión («AWS CDK v2» → «aws cdk», «Pydantic v2» → «pydantic»). */
export function normalize(label: string) {
  return label
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+v\d+(\.\d+)*$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Logo de una etiqueta del sitio, o `null` si no tiene marca (RAG, FinOps, Patrón BFF…).
 * Las compuestas usan el primer segmento con logo: «S3 / EFS» → S3, «SQS/SNS» → SQS, «CDK · Python» → CDK,
 * «Keycloak / Cognito» → Keycloak, «pytest / Mutation testing» → pytest.
 */
export function brandIcon(label: string): BrandIconData | null {
  for (const part of label.split(/\s*[/·]\s*/)) {
    const icon = BRAND_ICONS[normalize(part)];
    if (icon) return icon;
  }
  return null;
}

/** Luminancia relativa WCAG de un color `#rrggbb`. */
export function relativeLuminance(hex: string) {
  const channel = (offset: number) => {
    const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

/** Color de relleno sobre fondo oscuro: las marcas casi negras (#000000, #181717, #191919…) se pintan claras. */
export const DARK_BRAND_FILL = "#e6edf3";
export function brandFill(hex: string) {
  return relativeLuminance(hex) < 0.08 ? DARK_BRAND_FILL : hex;
}
