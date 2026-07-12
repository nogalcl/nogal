# BUSINESS_RULES.md — Nogal

Estas reglas gobiernan el comportamiento del marketplace independientemente de la implementación técnica. Toda funcionalidad debe respetar estas reglas; cualquier excepción debe documentarse explícitamente como decisión de producto.

## 1. Reglas generales del marketplace

1. **Cada `Listing` representa una pieza única o una tirada explícitamente limitada.** No existe el concepto de "stock" en el sentido de e-commerce tradicional. Si un vendedor tiene varias unidades idénticas (p. ej. un par de sillas), se modela como un único listing con cantidad explícita ≤ un límite bajo (p. ej. 4), nunca como inventario indefinido.
2. **La plataforma cobra una comisión sobre cada transacción completada**, retenida automáticamente vía Stripe Connect en el momento del payout al vendedor. El porcentaje puede variar por categoría o nivel de vendedor, pero siempre se muestra de forma transparente al vendedor antes de publicar.
3. **El precio se muestra siempre con impuestos y moneda claros.** No se permite "precio a consultar" como único modo: incluso en piezas de alto valor, debe existir al menos un rango de precio o un precio de referencia público, salvo en casos de piezas en proceso de tasación (estado `PENDING_APPRAISAL`, no visible públicamente hasta fijar precio).
4. **No hay carrito multi-vendedor.** Cada compra es una transacción 1 comprador–1 vendedor–1 pieza. Esto es consecuencia directa de que las piezas son únicas y de que la logística (a menudo white-glove) es específica por pieza y vendedor.

## 2. Reglas de publicación (Listings)

1. **Fotografía mínima obligatoria**: un listing no puede publicarse con menos de 6 fotografías, incluyendo al menos una que muestre defectos/desgaste visibles si existen. Esto protege al comprador y reduce disputas post-venta.
2. **Descripción de condición obligatoria y estructurada**: el vendedor debe seleccionar un estado de conservación de una escala cerrada (p. ej. _Excelente / Muy bueno / Bueno / Restaurado / Para restaurar_) y no puede dejarlo en blanco ni describirlo solo en texto libre.
3. **Dimensiones obligatorias** (alto, ancho, profundidad, y peso si es relevante para envío). Un listing no puede pasar a estado `PUBLISHED` sin estos campos.
4. **Procedencia recomendada, obligatoria a partir de un umbral de precio.** Por debajo de un umbral configurable (p. ej. 500€), la procedencia es opcional. Por encima de él, y siempre en piezas categorizadas como "antigüedad" o "colección", se requiere al menos un `ProvenanceRecord` antes de publicar. Un listing de alto valor sin procedencia documentada es un riesgo de confianza que la plataforma no debe asumir por defecto.
5. **Todo listing nuevo entra en cola de moderación (`PENDING_REVIEW`) antes de ser visible públicamente.** No hay publicación instantánea, ni siquiera para vendedores verificados con historial (aunque su cola puede tener prioridad/SLA más corto — ver §5).
6. **Un listing vendido pasa automáticamente a `SOLD` y desaparece de resultados de búsqueda activa**, pero permanece accesible como referencia histórica (precio de venta) para transparencia de mercado, sin datos personales del comprador.
7. **El vendedor no puede editar precio, dimensiones ni fotografías principales de un listing con una oferta pendiente activa** sin notificar al ofertante, para evitar prácticas de "carnada y cambio".

## 3. Reglas de usuarios y vendedores

1. **Edad mínima 18 años** para crear cuenta, comprar o vender (transacciones financieras vinculadas a KYC).
2. **Todo vendedor debe completar verificación de identidad (KYC vía Stripe Identity/Connect) antes de poder publicar su primer listing.** No existe modo "vendedor no verificado publicando en abierto".
3. **Niveles de vendedor**: se define al menos `Nuevo`, `Verificado`, `Distinguido` (histórico de ventas y reseñas consistentes). El nivel afecta visibilidad en el listado y puede afectar la comisión, pero **nunca afecta si un listing pasa por moderación** — la revisión de contenido es independiente del historial de ventas, aunque sí puede afectar el SLA de revisión.
4. **Un comprador y un vendedor no pueden ser la misma parte en una transacción** (no autocompra), verificado por identidad, no solo por cuenta.
5. **Los datos de pago nunca se almacenan en la base de datos propia**; viven exclusivamente en Stripe.

## 4. Reglas de ofertas y negociación

1. **Una oferta tiene una validez temporal explícita** (p. ej. 48h); pasado ese plazo expira automáticamente sin necesidad de acción del vendedor.
2. **El vendedor puede aceptar, rechazar o contraofertar**, pero no puede modificar unilateralmente el listing para "invalidar" una oferta activa sin resolverla primero (ver §2.7).
3. **Aceptar una oferta bloquea el listing temporalmente** (`RESERVED`) mientras se completa el pago, con un tiempo límite tras el cual vuelve a estar disponible si el comprador no completa la compra.

## 5. Reglas de moderación

1. **Toda pieza nueva se revisa antes de publicarse**; todo vendedor nuevo se revisa antes de operar. Ningún contenido generado por usuarios es público por defecto sin paso humano o heurístico de revisión.
2. **Motivos de rechazo de un listing** incluyen (no exhaustivo): fotografías insuficientes o de baja calidad, descripción incompleta, precio manifiestamente fraudulento, sospecha de falsificación/reproducción no declarada como tal, categoría incorrecta, contenido prohibido.
3. **Categorías prohibidas explícitamente**: réplicas o reproducciones no declaradas como tales vendidas como originales, piezas con materiales de comercio restringido (p. ej. marfil, ciertas maderas protegidas por CITES) sin certificación legal, artículos robados o de procedencia dudosa reportada.
4. **Toda reproducción/réplica debe declararse como tal explícitamente en el título y ficha** — nunca puede describirse ambiguamente de forma que sugiera originalidad histórica.
5. **Sistema de reportes**: cualquier usuario autenticado puede reportar un listing o un perfil; un reporte no oculta el contenido automáticamente, pero eleva su prioridad de revisión. Un umbral de reportes coincidentes sí puede despublicar temporalmente en modo cautelar hasta revisión humana.
6. **Los moderadores tienen un rol distinto de administrador**: pueden aprobar/rechazar contenido y suspender cuentas temporalmente, pero no pueden modificar comisiones, configuración de pagos ni acceder a datos financieros sin un rol adicional explícito.
7. **Toda acción de moderación queda auditada** (quién, cuándo, motivo) — no hay rechazo o suspensión sin registro trazable.

## 6. Reglas de valoraciones (Reviews)

1. **Solo se puede valorar tras una orden completada** (`Order.status = COMPLETED`), y solo por las dos partes de esa orden específica. No hay reseñas de piezas sin compra verificada.
2. **La valoración es bidireccional**: el comprador valora al vendedor (calidad de la pieza recibida frente a lo descrito, comunicación, tiempo de envío) y el vendedor valora al comprador (comunicación, cumplimiento de pago).
3. **Ventana de valoración limitada** (p. ej. 30 días tras `COMPLETED`), pasado el cual la orden queda cerrada a nuevas reseñas.
4. **Las reseñas no son editables tras publicarse**, solo pueden ser retiradas por moderación ante reporte fundamentado (lenguaje abusivo, información falsa verificable), nunca por solicitud unilateral de la parte valorada.
5. **No existe reseña anónima**: el nombre visible del autor es el mismo que usa en la plataforma, para sostener la confianza del sistema.

## 7. Reglas de envío y logística

1. **El vendedor declara el método de envío disponible por listing** (estándar, White Glove/instalación, solo recogida en persona), dado que el mobiliario de gran formato a menudo no puede enviarse por paquetería estándar.
2. **Piezas por encima de un umbral de tamaño/peso requieren obligatoriamente método White Glove o recogida**, nunca paquetería estándar — regla de validación en la creación del listing, no solo recomendación.
3. **El comprador debe confirmar la recepción** (o el sistema la asume automáticamente tras un plazo desde la entrega confirmada por tracking) antes de liberar el payout al vendedor — el pago del comprador queda retenido por la plataforma hasta ese momento.

## 8. Reglas de disputas

1. **No se aplica una política de devolución estándar de "30 días sin preguntas"**: al tratarse de piezas únicas y de alto valor, las disputas se gestionan caso por caso a través de un flujo de mediación (evidencia fotográfica, comparación con la ficha original, historial de mensajes).
2. **El estado de conservación declarado en la ficha es el contrato de la venta.** Una discrepancia material y verificable entre lo declarado y lo recibido es motivo válido de disputa a favor del comprador.
3. **Mientras una orden está en disputa, el payout al vendedor queda retenido** hasta resolución.
