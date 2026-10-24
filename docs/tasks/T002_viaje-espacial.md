# T002 · Viaje espacial, fluidez y contenido

Fecha: 2026-10-24 · Diseño e implementación: el arquitecto (Claude Opus 5.5), por petición del responsable.

## Pedido del responsable
1. El hero con DataRain no armoniza: rediseñar el inicio como una **inmersión, un viaje**, con objetos 3D, dentro de la
   temática del sitio (espacio, estrellas) y pulida.
2. La web va «a tirones».
3. La foto del retrato ASCII repite la de la tarjeta de contacto.
4. La etapa de Inetum es demasiado general.
5. Insignias reales de AWS Demonstrated.
6. Añadir CloudPath (Platanus Build Night, 3.er puesto).

## Diagnóstico de los tirones (export de producción, scroll con rueda a 1440×900)
- LaserFlow compila sus shaders de forma síncrona en el primer render: tarea de 400–575 ms al salir del inicio
  (`getProgramInfoLog` de three.js, 662 ms en el perfil).
- Heatmap: el tamaño de celda depende de `100cqi`; cualquier cambio dentro de la tarjeta recalcula las 371 celdas
  (13 tareas de 65–230 ms; con tamaño fijo bajan a 3).
- Layout de página completa por animaciones de `height` (ritmo mensual) y texto tecleado letra a letra.
- `content-visibility: auto` maqueta cada sección al entrar en pleno scroll.
- Efectos OGL (Dither, RippleGrid, Scanner) compilan ~180 ms al acercarse.

## Ítems críticos y definición de hecho
### I1 · Hero «viaje»
- [ ] Una sola escena three.js (sin DataRain, sin SVG de constelación ni Scanner en el inicio): estrella-idea → sistema
      con tres planetas (Contexto, Agentes, Producción) → sistema en marcha, guiado por el scroll.
- [ ] Shaders compilados con `compileAsync` antes del primer fotograma; carga diferida (`next/dynamic`), el H1 sigue
      siendo HTML del servidor.
- [ ] Pausa con «Movimiento», fuera de vista y con pestaña oculta (0 frames); movimiento reducido: fotograma fijo, sin
      tramo fijado de scroll.
- [ ] Escritorio ≥ 55 fps de media en el hero; móvil 390×844 sin desbordamiento.
### I2 · Fluidez
- [ ] Recorrido completo con rueda: ninguna tarea larga > 120 ms y, fuera del arranque, ninguna > 80 ms.
- [ ] Actividad sin tareas > 60 ms.
### I3 · Contenido
- [ ] Inetum: texto concreto sin cliente, sin versiones internas ni datos de documentos; nada en producción que no lo esté.
- [ ] CloudPath con enlaces públicos; insignias oficiales de Credly en AWS Demonstrated y Early Adopter.
- [ ] Actividad sin la foto: arte ASCII propio de la temática espacial.
### I4 · Calidad
- [ ] `node --test`, `tsc`, `pnpm build`; First Load JS de `/` ≤ 265 kB; consola limpia y 0 px de scroll horizontal en
      1440/768/390, con y sin movimiento reducido, ES/EN.
### I5 · Gates
- [ ] Sin push ni deploy sin aprobación. El cambio en `LaserFlow.jsx` (antes protegido) se limita a compilar en
      asíncrono, sin tocar el efecto.

## Cierre
_(al final)_
