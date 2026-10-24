# Nebulosa y Scanner

Iteración del 7 de septiembre de 2026, basada en la referencia visual facilitada por el propietario del portafolio. La referencia se utiliza para composición y ambiente; sus textos no se incorporan al sitio.

## Textura de nebulosa

Generada con la herramienta integrada de generación de imágenes, sin CLI ni llamadas a un servicio desde el portafolio. El PNG original se convirtió con Sharp a WebP, sin reescalar la versión de escritorio:

| Archivo local | Dimensiones | Tamaño |
| --- | --- | --- |
| `public/assets/nebula-blue.webp` | 1672 × 941 | 72 466 bytes |
| `public/assets/nebula-blue-mobile.webp` | 960 × 540 | 23 680 bytes |

La imagen se usa como textura estática de fondo. Las estrellas, estelas, etiquetas, órbitas y conexiones permanecen en Canvas/SVG. La versión móvil se selecciona mediante media query; no se descarga vídeo ni se renderiza una nebulosa procedural por fotograma.

Prompt final, modo integrado (`image_gen`):

> Use case: stylized-concept. Asset type: a background-only raster nebula texture for a senior AI engineer's dark portfolio website, wide landscape 16:9 composition. Create a cinematic but restrained deep-space star cloud. A wispy, intricate band of interstellar blue and teal gas with a faint muted plum and warm dust core crosses diagonally from the lower left edge through the middle-right toward the upper right. Fine fractal filaments and translucent cloud pockets, realistic astronomical cloud detail, sparse tiny distant stars, deep near-black navy negative space. The left 40 percent stays particularly dark and quiet for large white website headline text to be composited later. The right middle should have more blue nebula detail behind a separately coded constellation diagram. Keep the outer edges dark so it blends naturally into #070b13. Strong local detail in the gas but controlled overall brightness, no large bright orbs. This is ONLY the astronomical background texture, NOT a website mockup. Absolutely no text, no letters, no interface, no icons, no borders, no diagram nodes, no orbit lines, no logos, no planet, no central black hole, no lens flare, no artificial electric arcs. Native canvas stars and SVG electric trails will be added separately by code. Generate one polished landscape image.

## Scanner

El shader corresponde al componente React Bits Scanner adjuntado por el usuario. Su licencia se conserva en `src/components/reactbits/LICENSE.md`. La adaptación local está en `Scanner.jsx` y se integra mediante `ScannerSurface.tsx`.

- Núcleo: recorte circular SVG, hasta 24 fps, DPR máximo 1.5 y presupuesto de 50 000 píxeles.
- Contacto: pase independiente de hasta 24 fps, DPR máximo 0.85 y presupuesto de 750 000 píxeles. Su máscara mantiene legible el contenido y evita bordes rectangulares visibles.
- Carga diferida cerca de la vista; sin montaje WebGL con movimiento reducido y con alternativa estática si falta WebGL 2.
- La visibilidad y la pausa usan `createRenderLoop`; el tiempo se acumula solo al animar, sin saltar al reanudar. Se liberan geometría, programa y contexto al desmontar.
- La pausa del inicio también detiene el Scanner del núcleo y las señales SVG. Contacto dispone de su propio control de pausa. Los eventos de interacción se capturan desde la sección para funcionar sobre controles enfocados.
- Los filamentos eléctricos son trayectorias SVG fijas con pequeños segmentos luminosos que se desplazan; no se recalcula geometría en cada fotograma ni se añaden destellos estroboscópicos.

LaserFlow y `ProfileLaser.tsx` no se modifican en esta iteración.

# Logos de tecnologías

Iteración del 24 de octubre de 2026 (T001 · I5). El Marquee y los chips de Stack, Proyectos y Experiencia muestran el logo de la tecnología antes de la etiqueta: `src/components/BrandIcon.tsx` lo pinta y `src/lib/brandIcons.ts` resuelve cada etiqueta del sitio (las compuestas usan el primer segmento con logo: «S3 / EFS» → S3, «Keycloak / Cognito» → Keycloak). Los logos son decorativos (`aria-hidden`): la etiqueta de texto ya nombra la tecnología.

## Marcas: Simple Icons

- Paquete npm `simple-icons` **16.35.0** (versión exacta en `package.json`). Los datos del proyecto se publican bajo CC0 1.0, pero su `DISCLAIMER.md` aclara que no todos los iconos son CC0 y que cada marca pertenece a su dueño y tiene sus propias guías.
- Solo se importan los 23 iconos usados, como named exports (`siPython`, …): en producción el resto del paquete queda fuera (un chunk de 14,5 KB gzip con esos 23 iconos).
- SVG inline de 24 × 24 con el color oficial (`hex`). Las marcas casi negras (luminancia relativa < 0,08) se pintan `#e6edf3` para el fondo oscuro: OpenJDK, Model Context Protocol, OpenTelemetry, Rust y Keycloak.
- «Java» usa el icono de OpenJDK, la implementación de referencia de Java SE: Simple Icons no incluye el logo de Java.

Licencias y guías declaradas por el paquete para los iconos usados:

| Icono (slug) | Licencia declarada | Guías de marca |
| --- | --- | --- |
| `apacheairflow` | Apache-2.0 | apache.org/foundation/marks |
| `keycloak` | Personalizada (uso de marcas de la Linux Foundation) | linuxfoundation.org/legal/trademark-usage |
| `openjdk` | BSD-3-Clause | — |
| `opentelemetry` | CC BY 4.0 | cncf-branding.netlify.app/projects/opentelemetry |
| `rust` | CC BY-SA 4.0 | rust-lang.org/policies/media-guide |
| `opensearch`, `postgresql`, `python`, `streamlit`, `typescript`, `whatsapp` | Sin dato | Enlace en el campo `guidelines` de cada icono |
| `docker`, `fastapi`, `githubactions`, `googlegemini`, `langchain`, `modelcontextprotocol`, `onnx`, `pydantic`, `pytest`, `ruff`, `springboot`, `telegram` | Sin dato | Sin dato |

Atribución: logo de OpenTelemetry (CNCF), CC BY 4.0; logo de Rust (Rust Foundation), CC BY-SA 4.0. Ambos proceden de Simple Icons y se muestran recoloreados a `#e6edf3`.

## Servicios AWS: AWS Architecture Icons

- Paquete oficial descargado de https://aws.amazon.com/architecture/icons/: `Icon-package_07312026` (publicación del 31 de julio de 2026, la vigente el 24 de octubre de 2026).
- Iconos de servicio de 16 px (`Architecture-Service-Icons_07312026/<categoría>/16/Arch_<servicio>_16.svg`: viewBox 24 × 24, cuadrado del color de la categoría y glifo blanco). Para la etiqueta «AWS», el logo de grupo `Architecture-Group-Icons_07312026/AWS-Cloud-logo_32.svg`.
- Copiados a `public/brand/aws/<slug>.svg` y optimizados: sin declaración XML, `<title>`, `id`, `version` ni `xmlns:xlink`, y sin `width`/`height` en la raíz; coordenadas redondeadas a 3 decimales. La geometría y los colores no cambian. 17 archivos, 34 843 bytes en total.

| Archivo | Icono original |
| --- | --- |
| `aws.svg` | AWS-Cloud-logo_32 |
| `bedrock.svg` | Arch_Amazon-Bedrock_16 |
| `cdk.svg` | Arch_AWS-Cloud-Development-Kit_16 |
| `cloudformation.svg` | Arch_AWS-CloudFormation_16 |
| `cloudfront.svg` | Arch_Amazon-CloudFront_16 |
| `codepipeline.svg` | Arch_AWS-CodePipeline_16 |
| `dynamodb.svg` | Arch_Amazon-DynamoDB_16 |
| `ecr.svg` | Arch_Amazon-Elastic-Container-Registry_16 |
| `ecs.svg` | Arch_Amazon-Elastic-Container-Service_16 |
| `fargate.svg` | Arch_AWS-Fargate_16 |
| `kinesis.svg` | Arch_Amazon-Kinesis_16 |
| `lambda.svg` | Arch_AWS-Lambda_16 |
| `rds.svg` | Arch_Amazon-RDS_16 |
| `rekognition.svg` | Arch_Amazon-Rekognition_16 |
| `s3.svg` | Arch_Amazon-Simple-Storage-Service_16 |
| `sns.svg` | Arch_Amazon-Simple-Notification-Service_16 |
| `sqs.svg` | Arch_Amazon-Simple-Queue-Service_16 |

- Condiciones de uso: según la página oficial, «We allow customers and partners to use these toolkits and assets to create architecture diagrams» y «You can also put icons in materials like whitepapers, presentations, data sheets, and posters». Los nombres y logos de AWS son marcas de Amazon.com, Inc. o sus filiales. En el sitio se muestran sin recortar ni recolorear; la presentación solo añade un radio de esquina del 22 % (2–3 px) por CSS y dibuja el cuadrado 2 px más pequeño que la caja del logo para igualar su peso óptico con los glifos de Simple Icons.
- No se copian EFS, Cognito ni CodeBuild: las etiquetas compuestas que los nombran muestran el logo de su primer servicio.

## Sin logo

Los conceptos y prácticas sin marca (RAG, LLMOps, FinOps, Event-Driven, Function Calling, Prompt Engineering, Patrón BFF, Mutation testing, Arquitectura hexagonal, OCR, SLM on-premise, Gobernanza de datos, Ingeniería de software, Analítica de datos, WebSockets, UI Automation, DXGI) y las herramientas sin icono en Simple Icons (Strands Agents, pgvector, Ragas, sentence-transformers, Bandit) no llevan logo. En el Marquee conservan su icono Phosphor en cian.
