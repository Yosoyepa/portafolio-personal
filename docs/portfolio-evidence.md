# Contenido y decisiones del portafolio

Revisión: 7 de septiembre de 2026. Los repositorios se consultaron con la CLI autenticada de GitHub, en modo de lectura. No se extrajo código de repositorios privados ni se añadió un servicio externo al explorador.

## Casos públicos seleccionados

| Caso | Evidencia consultada | Alcance presentado |
| --- | --- | --- |
| Write, Check, Trust | [README](https://github.com/Yosoyepa/write-check-trust), [tiers](https://github.com/Yosoyepa/write-check-trust/blob/main/tools/wct/gate/runner.py) | Template y arnés Python en beta. Calidad, arquitectura, mutación e integridad; sin cifras de ahorro de modelos. |
| Personal Assistant | [README](https://github.com/Yosoyepa/personalAssistant), [release alpha](https://github.com/Yosoyepa/personalAssistant/blob/main/docs/releases/v0.2.0-alpha.2.md) | Runtime determinista, WhatsApp/Telegram, outbox PostgreSQL, operación controlada. Las cifras de pruebas se atribuyen a la release, no a una ejecución local nuestra. |
| Secret Oracle | [README y arquitectura](https://github.com/Yosoyepa/secret-oracle-hackathon-aws) | Juego de hackathon en equipo, Bedrock + Rekognition, estado oculto, Lambda y CDK. El premio también aparece en las memorias profesionales. |
| RAG sobre información pública | [README](https://github.com/Yosoyepa/bbva-colombia-rag-assistant) | Prueba técnica independiente con contenido público; no se presenta como trabajo contratado ni producto oficial de BBVA. |
| BioStock | [README](https://github.com/Yosoyepa/BioStock-Systems-Infra) | Cinco stacks CDK y seis microservicios. Entorno efímero; se corrigió la promesa de coste cero permanente. |
| CodeGuardAI | [README](https://github.com/Yosoyepa/CodeGuardAI), [orquestador](https://github.com/Yosoyepa/CodeGuardAI/blob/main/backend/src/agents/orchestrator.py), [Gemini](https://github.com/Yosoyepa/CodeGuardAI/blob/main/backend/src/external/gemini_client.py), árbol de tests | Contribución colaborativa. El código contiene agentes, clientes Gemini/MCP y tests de integración, aunque las casillas del roadmap del README están desactualizadas. |

También se revisó el inventario público de proyectos propios y colaboraciones. La selección prioriza relación con IA aplicada, fiabilidad de software e infraestructura; no incluye forks por el mero hecho de aparecer en el perfil.

## Trayectoria

- Inetum: se utilizó el resumen público permitido de `13_trayectoria_inetum.md`: IDP, OCR, arquitectura hexagonal, SLM local y gobernanza. No se publicaron versiones internas, documentos de clientes, datasets, identidades de clientes ni arquitectura interna.
- Blend360: `02_trayectoria_blend360.md`, `03_proyectos_clave.md` y el perfil profesional respaldan agentes Bedrock/Strands, observabilidad Kinesis/DynamoDB/S3, extracción PDF, Airflow/ECS/CDK, BFF, formación y aprovisionamiento de 16+ componentes. La promoción se expresa como 2–3 meses, consistente con diciembre–marzo.
- Educación y credenciales: perfil profesional existente; se conservaron las tres etapas laborales y las credenciales que ya mostraba el portafolio.

## Experiencia e interacción

- El hero representa conexiones entre contexto, agentes y producción en una constelación SVG estable, con iconos, etiquetas y un núcleo de orquestación. Sustituye la deformación por una ligera inclinación y conexiones que se iluminan. El fondo estelar abarca todo el inicio en un Canvas 2D con estelas y rastro del cursor acotado. La última iteración incorpora una nebulosa WebP y Scanner en el núcleo y Contacto, con los presupuestos detallados abajo. Las demás secciones comparten polvo estelar estático, órbitas y gradientes tenues. No carga vídeo ni el shader de la galaxia.
- LaserFlow conserva sus archivos y su shader. Las tarjetas interiores reciben enlaces al stack y realce al interactuar; el cálculo existente sigue midiendo el contenedor para alinear el haz.
- La trayectoria muestra una historia editorial por etapa. El explorador es complementario; las respuestas se pintan inmediatamente, sin esperar una animación de salida ni perder el foco del input.
- Dither combina ondas y cuantización en un único pase OGL. Se prepara antes de entrar en pantalla y conserva el contexto al desplazarse, con render suspendido fuera de vista. Los eventos del puntero se escuchan en captura desde la sección.
- La tarjeta de contacto gira con un botón. La cara oculta queda `inert`, se mueve el foco a la cara visible y Escape vuelve a la portada. No se abre ningún canal hasta elegir un enlace.
- Los filtros y detalles usan controles nativos. Las animaciones de diagramas de proyectos solo corren durante interacción. La preferencia de movimiento reducido se respeta.

## Verificación

- `pnpm test`: 17 pruebas aprobadas, con recuperación ES/EN, referencias públicas, seis proyectos, tres etapas y suspensión del ciclo de renderizado.
- `pnpm build`: compilación, tipos y exportación estática correctos. La revisión con Scanner informa 267 kB de JavaScript inicial; no se presenta este trabajo como una reducción medida del bundle o del consumo del dispositivo.
- Navegador: composición a 1920 × 1080, 768 × 1024 y 390 × 844, sin desbordamiento horizontal en las vistas inspeccionadas. Se comprobaron filtros, detalles, ES/EN, controles del inicio y tarjeta reversible.
- Explorador: al enviar con Enter, los resultados aparecen con el input enfocado. Una consulta sin coincidencias muestra su estado vacío; limpiar devuelve el foco al input.
- Consola de la revisión final sin errores. Los tres archivos protegidos de LaserFlow coinciden con sus hashes anteriores al rediseño.
- `graphify update .` completado para actualizar el índice de código local.

## Referencias de esta iteración visual

Se revisó el [catálogo de React Bits](https://www.reactbits.dev/get-started/index), especialmente las familias de partículas, líneas y respuesta magnética del cursor. La constelación y sus iconos se dibujan localmente. La separación entre detalle SVG y fondo Canvas permite limitar el trabajo animado, siguiendo las consideraciones de [rendimiento de animación de MDN](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Animation_performance_and_frame_rate).

La revisión de esta iteración confirmó el fondo de estrellas a lo ancho de 1920 px, conexiones vectoriales legibles en móvil de 390 px, traducciones ES/EN, selección de etapa y pausa de las señales. La interacción de proximidad iluminó la ruta de contexto al acercar el cursor. El lienzo de estrellas a 1920 × 979 utiliza 1 879 680 píxeles; esto verifica el presupuesto del búfer, no un ahorro medido de CPU/GPU. La consola no registró errores durante estas comprobaciones.

## Referencia de nebulosa y Scanner

Se incorporó Scanner desde el código adjunto por el usuario, con shader conservado y ciclo de vida adaptado. Su pase circular en el núcleo se combina con filamentos SVG azules; el pase de Contacto utiliza una máscara suave y permite girar la tarjeta sin capturar sus clics. La textura de nebulosa, sus dos WebP y el prompt de generación están documentados en `docs/visual-assets.md`.

La revisión de producción comprobó:

- Composición a 1920 × 1080, 768 × 1024 y 390 × 844, sin desbordamiento horizontal. La constelación escala como SVG; su Scanner reajusta el búfer al cambiar el tamaño del SVG exterior.
- Núcleo de 122 × 122 píxeles con DPR 1 a 1920 px y 108 × 108 a 768 px. Contacto de 1268 × 591 (749 388 píxeles) en escritorio y 331 × 1153 (381 643) en móvil. Son dimensiones observadas; los límites configurados son 50 000 y 750 000 respectivamente.
- Selección de contexto/producción y textos asociados; pausa y reanudación del inicio con las nueve capas SVG de corriente/órbita en estado pausado. Control independiente de Contacto y etiquetas traducidas ES/EN.
- Giro de la tarjeta en escritorio y móvil, enlaces correctos a Email, LinkedIn y GitHub, y retorno con Escape que restaura el foco al botón de la portada.
- Corrección de una observación de tamaño tardía de RippleGrid que encontraba una referencia nula al salir de Stack. El callback usa el contenedor de su propio montaje y descarta notificaciones tras desconexión; se liberan programa y geometría al desmontar. Se verificó Stack → Contacto y la misma transición cambiando a viewport móvil, sin errores de consola.
- `pnpm test`: 17 pruebas aprobadas. `pnpm build`: exportación correcta. `git diff --check`: sin errores. Los hashes de los tres archivos de LaserFlow protegidos siguen coincidiendo con el estado anterior.

## Iteración «Señal viva» (24 de octubre de 2026)

Criterios, plan y cierre en `docs/tasks/T001_senal-viva.md`.

- **Actividad de GitHub.** `scripts/fetch-github-activity.mjs` consulta la API GraphQL como `Yosoyepa` y guarda un
  snapshot compacto. El total del último año (2 690) coincide con `contributionCalendar.totalContributions` (diferencia
  0). El calendario público de github.com ya muestra las contribuciones privadas de forma anónima, así que el snapshot
  no expone nada que no fuera público; no incluye nombres de repositorios. La barra de lenguajes usa los 29 repos
  públicos propios y no fork, con el mismo peso por repo.
- **Ommatix.** Textos tomados del README público (`Yosoyepa/Ommatix`, estado al 19 de octubre de 2026): prototipo de
  investigación, contrato MCP de tres herramientas, actuación fail-closed y evaluación preliminar AG-02 con sus
  advertencias (una serie por modelo, apps sintéticas, sin ranking).
- **Credenciales.** Diplomado en Machine Learning y Data Science (UNAL, en curso) y Desarrollo Seguro (CC) COL
  (Net4skills · NETEC, julio de 2026), según la memoria profesional del responsable. AgenticRank no se publica: falta
  cotejarlo con el badge.
- **Métrica.** «500+ commits rastreados» pasa a leer las contribuciones del último año del snapshot.

## Iteración T002 (24 de octubre de 2026)

Criterios en `docs/tasks/T002_viaje-espacial.md`.

- **CloudPath.** Textos tomados del README público de `Yosoyepa/agentic-dev-hackathon-setup` (consultado el 24 de
  octubre de 2026): proyecto para «Platanus Build Night 2026 — Bogotá @ Buk»; entrevista por voz con Gemini Live, token
  efímero, consentimiento de micrófono y fallback escrito; mapa React Flow con contratos versionados; arquitectura
  Vite + React + TypeScript → FastAPI en Railway → Gemini Live, Claude → MiniMax, AWS Knowledge MCP read-only y
  degradación determinista. El README de `product/api` del mismo repo detalla el token de un solo uso y las rutas de
  perfil, lección y adaptación. `Yosoyepa/cloudpath-front` es el frontend (Vite, desplegado en
  `cloudpath-front.vercel.app`); a esta fecha no tiene README propio, así que la descripción sale del repo de la API.
- **3.er puesto.** Lo declaró el responsable el 24 de octubre de 2026; ninguno de los dos README lo menciona.
- **Inetum.** Redactado desde la memoria profesional del responsable y anonimizado: sin nombre del cliente, sin
  versiones internas y sin datos de documentos. Pendiente de revisión del responsable antes de publicar.
- **TryTrust.** Fuentes: memoria profesional del responsable (`hackathons_y_certificaciones_2026`, entrada NextWave);
  repos públicos `bysergr/trytrust-platform`, `bysergr/trytrust-backend` y `bysergr/trytrust-merchants`, y el espejo
  público `Yosoyepa/trystrus2` (enlace del caso; los cuatro comprobados con `gh` el 24 de octubre de 2026). El 3.er
  puesto en la sede Bogotá lo declaró el responsable; la web oficial del NextWave Hackathon no publica el podio por sede.
- **Stack actual.** Grupos de Stack, Marquee y tarjetas de Perfil tomados de la memoria profesional del responsable
  (perfil y stack, sección «Stack actual (octubre 2026)»): OpenShift, Argo CD, Kustomize, Podman, RabbitMQ, Celery,
  OCR local y la cadena de calidad de la plataforma documental de Inetum. Logos de Simple Icons 16.35.0; Kustomize,
  Gitleaks, Hadolint, import-linter, PyMuPDF, RapidOCR y Tesseract no tienen icono en esa versión y se muestran sin logo.
