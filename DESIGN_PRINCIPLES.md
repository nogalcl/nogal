# DESIGN_PRINCIPLES.md — Nogal

Estas son reglas de diseño **que nunca deben romperse**. No son sugerencias de estilo: son restricciones de identidad de producto. Cualquier componente o pantalla que las viole debe rediseñarse, no justificarse como excepción puntual.

## 1. Posicionamiento

Nogal debe sentirse como una **galería de diseño, un estudio de arquitectura o una casa de subastas** — nunca como una aplicación SaaS, una app de comercio genérica, ni un producto que "se nota hecho con IA o con un template". La referencia mental correcta es un catálogo impreso de alta gama o el sitio de una casa de subastas de prestigio, no un dashboard de producto.

## 2. Reglas que nunca se rompen

1. **No usar dashboards genéricos.** Ninguna pantalla debe organizarse como una grilla de tarjetas de KPIs con iconos y números grandes. Si se necesita mostrar métricas a un vendedor (V2), se presentan como texto editorial y tablas simples, no como widgets de analítica.
2. **No usar componentes típicos de aplicaciones SaaS.** Sin sidebars de navegación con iconos apilados al estilo admin panel, sin "empty states" ilustrados con mascotas o ilustraciones vectoriales genéricas, sin badges de colores saturados, sin onboarding con confetti o checklists gamificadas.
3. **La fotografía manda.** En cualquier pantalla donde exista una pieza, la imagen ocupa el protagonismo visual absoluto — nunca compite en peso visual con texto, botones o chrome de interfaz. Las miniaturas nunca se recortan de forma que oculten información relevante de la pieza (el recorte respeta la composición original siempre que sea posible).
4. **Diseño editorial**, no diseño de producto. Se usan estructuras de maquetación propias del diseño editorial/impreso: rejillas asimétricas, jerarquía tipográfica marcada, márgenes generosos, ocasionalmente una sola imagen a sangre completa (full-bleed) por sección.
5. **Espacio en blanco generoso y deliberado.** El espacio negativo es un elemento de diseño, no un vacío a rellenar. Ninguna pantalla debe sentirse "densa" o "eficiente" en el sentido de apps SaaS que maximizan información por pixel.
6. **Animaciones discretas y funcionales, nunca decorativas.** Transiciones de opacidad y desplazamiento sutil (200–400ms, easing suave) para cambios de estado o navegación. Prohibido: parallax exagerado, micro-interacciones "juguetonas", loaders animados llamativos, confetti, bounce.
7. **Experiencia premium en cada detalle**, incluyendo estados de carga (skeletons sobrios, nunca spinners genéricos coloridos), estados vacíos (mensaje editorial breve, nunca ilustración de stock) y mensajes de error (tono sobrio, nunca emojis ni tono desenfadado).

## 3. Paleta cromática

Paleta cerrada. No se introducen colores fuera de esta gama sin una razón funcional explícita (p. ej. rojo para error crítico, usado con extrema moderación).

| Color            | Uso                                                                                            |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| **Negro carbón** | Texto principal, fondos en modo oscuro, acentos de máximo contraste                            |
| **Espresso**     | Superficies oscuras secundarias, hover states sobre fondo claro                                |
| **Café oscuro**  | Acentos cálidos, bordes, elementos secundarios                                                 |
| **Nogal**        | Color de marca — usado con intención en acentos clave, nunca como color de fondo masivo        |
| **Beige cálido** | Fondo principal en modo claro — sustituye al blanco puro, que resulta demasiado "clínico"/SaaS |
| **Gris piedra**  | Texto secundario, líneas divisorias, elementos neutros                                         |

**Explícitamente prohibido**: amarillos, dorados, morados/violetas, glassmorphism (fondos difuminados translúcidos), gradientes decorativos, neones o cualquier color saturado usado como color de marca. Estos códigos visuales están asociados a productos SaaS/tech y rompen inmediatamente la percepción de atemporalidad y elegancia buscada.

## 4. Tipografía

- **Tipografía editorial de dos familias**: una serif de carácter para titulares (con presencia, ligeramente condensada o con detalles clásicos — referencia: familias tipo Canela, Freight Display, GT Sectra) y una sans-serif neutra y muy legible para texto de cuerpo e interfaz (referencia: familias tipo Söhne, Inter con tracking cuidado, o similar).
- **Jerarquía tipográfica marcada**: diferencias de tamaño notables entre titular, subtítulo y cuerpo — no la escala tipográfica plana típica de interfaces de producto.
- **Tracking y line-height cuidados** en titulares grandes; nunca texto de interfaz apretado o de tamaño mínimo por defecto.

## 5. Composición y layout

- Rejillas con **ritmo editorial**: alternancia de bloques grandes de imagen con bloques de texto, no una grilla uniforme de tarjetas repetidas de igual tamaño (evitar el "grid de e-commerce" de cajas idénticas).
- Fichas de producto con **galería protagonista** (posibilidad de imagen a pantalla completa/zoom) y la información comercial (precio, condición, procedencia) presentada como ficha técnica sobria, no como bloque de compra agresivo con banners de urgencia ("¡Solo queda 1!").
- Sin uso de **contadores de urgencia, badges de "oferta"/"descuento" llamativos, ni tácticas de escasez artificial** — contradicen el posicionamiento de confianza y atemporalidad.

## 6. Tono de contenido (aplica a copy e interfaz)

- Tono editorial, informativo, sobrio — nunca casual, nunca con exclamaciones múltiples ni emojis.
- Los textos de sistema (errores, confirmaciones) son claros y directos, sin intentar sonar "amigables" de forma forzada.

## 7. Cómo verificar que una pantalla cumple estos principios

Antes de dar por buena cualquier pantalla nueva, debe poder responderse "sí" a:

1. ¿La fotografía es lo primero que se percibe visualmente?
2. ¿Podría confundirse con la interfaz de un dashboard SaaS si se le quitara el logo? (La respuesta debe ser **no**.)
3. ¿Hay algún color fuera de la paleta definida?
4. ¿Hay espacio en blanco suficiente para que la composición respire, o se siente "llena"?
5. ¿Alguna animación dura más de lo estrictamente necesario para comunicar un cambio de estado?

Si la respuesta a 2, 3 o 5 sugiere un problema, la pantalla no está lista.
