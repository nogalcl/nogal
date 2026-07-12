import {
  PrismaClient,
  RoleName,
  FurnitureCondition,
  Originality,
  TrendCategory,
} from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

// "Estados del mueble" (FurnitureCondition) y "Décadas" no se siembran aquí:
// condición es un enum del propio schema (ver schema.prisma) y década es un
// entero simple en Furniture — ninguno de los dos es una tabla de catálogo.

const roles: Array<{
  name: RoleName;
  description: string;
  permissions: string[];
}> = [
  {
    name: "USER",
    description: "Comprador o vendedor estándar de la plataforma.",
    permissions: ["furniture:create", "favorite:manage", "message:send"],
  },
  {
    name: "MODERATOR",
    description: "Revisa publicaciones, vendedores y reportes.",
    permissions: [
      "furniture:moderate",
      "store:moderate",
      "report:resolve",
      "user:suspend",
    ],
  },
  {
    name: "ADMIN",
    description: "Acceso administrativo completo.",
    permissions: ["*"],
  },
];

const countries: Array<{ name: string; isoCode: string }> = [
  { name: "Dinamarca", isoCode: "DK" },
  { name: "Suecia", isoCode: "SE" },
  { name: "Noruega", isoCode: "NO" },
  { name: "Finlandia", isoCode: "FI" },
  { name: "Italia", isoCode: "IT" },
  { name: "Francia", isoCode: "FR" },
  { name: "Alemania", isoCode: "DE" },
  { name: "España", isoCode: "ES" },
  { name: "Reino Unido", isoCode: "GB" },
  { name: "Estados Unidos", isoCode: "US" },
  { name: "Portugal", isoCode: "PT" },
  { name: "Países Bajos", isoCode: "NL" },
  { name: "Bélgica", isoCode: "BE" },
  { name: "Austria", isoCode: "AT" },
  { name: "Japón", isoCode: "JP" },
  { name: "Chile", isoCode: "CL" },
  { name: "Argentina", isoCode: "AR" },
  { name: "Suiza", isoCode: "CH" },
  { name: "Hungría", isoCode: "HU" },
];

const materials: Array<{ name: string; description: string }> = [
  {
    name: "Madera maciza",
    description: "Estructuras en madera sólida, sin chapados ni aglomerados.",
  },
  {
    name: "Cuero",
    description:
      "Tapicerías y revestimientos en cuero natural o curtido al vegetal.",
  },
  {
    name: "Latón",
    description:
      "Herrajes, tiradores y detalles en latón macizo o baño de latón.",
  },
  {
    name: "Mármol",
    description:
      "Sobres y bases en mármol natural, habituales en mesas y consolas.",
  },
  {
    name: "Vidrio",
    description:
      "Superficies y elementos decorativos en vidrio soplado o templado.",
  },
  {
    name: "Mimbre",
    description:
      "Trenzado tradicional en mimbre, típico de piezas de exterior y asientos ligeros.",
  },
  {
    name: "Terciopelo",
    description:
      "Tapicerías en terciopelo, frecuentes en piezas Art Déco y contemporáneas.",
  },
  {
    name: "Acero",
    description:
      "Estructuras y patas en acero, características del diseño industrial.",
  },
  {
    name: "Cromo",
    description:
      "Acabados cromados, habituales en mobiliario Bauhaus y de los años 70.",
  },
  { name: "Bronce", description: "Detalles y esculturas en bronce fundido." },
  { name: "Cristal", description: "Elementos en cristal tallado o soplado." },
  { name: "Piedra", description: "Bases y sobres en piedra natural." },
];

// Incluye especies sudamericanas (Lenga, Raulí) además de las europeas
// habituales, dado el foco regional de varias piezas del catálogo.
const woodTypes: Array<{ name: string; description: string; content?: string }> = [
  {
    name: "Nogal",
    description:
      "Madera oscura y veteada, muy apreciada en el diseño de mediados de siglo.",
  },
  {
    name: "Roble",
    description:
      "Madera clara y resistente, habitual en mobiliario escandinavo.",
    content:
      "El roble es una de las maderas más utilizadas en la ebanistería europea por su dureza, resistencia a la humedad y veteado marcado. Su tono varía de un rubio claro (roble blanco) a tonos más cálidos cuando se trata con aceites naturales.\n\nEn el diseño escandinavo de posguerra, el roble se popularizó como alternativa más clara y accesible al nogal, especialmente en piezas destinadas a producción en mayor volumen. Su dureza lo hace especialmente adecuado para estructuras y patas sometidas a esfuerzo, aunque es más difícil de trabajar a mano que maderas blandas como el pino.",
  },
  {
    name: "Teca",
    description:
      "Madera tropical densa y resistente a la humedad, típica de piezas de exterior.",
  },
  {
    name: "Haya",
    description: "Madera clara de grano fino, común en estructuras curvadas.",
  },
  {
    name: "Palisandro",
    description:
      "Madera exótica de tono rojizo intenso, muy usada en los años 60 y 70.",
  },
  {
    name: "Caoba",
    description:
      "Madera cálida de tono rojizo, clásica del mobiliario de autor.",
  },
  {
    name: "Cerezo",
    description: "Madera de tono rosado que oscurece con el tiempo.",
  },
  {
    name: "Pino",
    description:
      "Madera clara y ligera, habitual en piezas rústicas e industriales.",
  },
  {
    name: "Fresno",
    description:
      "Madera clara de veta marcada, usada en diseño Bauhaus y contemporáneo.",
  },
  { name: "Olmo", description: "Madera robusta de veta pronunciada." },
  {
    name: "Cedro",
    description:
      "Madera aromática de tono cálido, habitual en piezas Art Déco.",
  },
  {
    name: "Lenga",
    description: "Especie nativa de la Patagonia, de grano fino y tono rosado.",
  },
  {
    name: "Raulí",
    description:
      "Madera sudamericana de tono rojizo, apreciada en ebanistería fina.",
  },
];

const styles: Array<{ name: string; description: string }> = [
  {
    name: "Mid-Century Modern",
    description:
      "Diseño de mediados del siglo XX, líneas orgánicas y funcionales, auge entre 1945 y 1970.",
  },
  {
    name: "Art Déco",
    description:
      "Estilo geométrico y ornamental de los años 20 y 30, materiales nobles y simetría marcada.",
  },
  {
    name: "Bauhaus",
    description:
      "Funcionalismo alemán de entreguerras: forma sigue a función, sin ornamento superfluo.",
  },
  {
    name: "Escandinavo",
    description:
      "Diseño nórdico de posguerra centrado en la artesanía, la luz natural y la madera clara.",
  },
  {
    name: "Victoriano",
    description:
      "Mobiliario ornamentado del siglo XIX británico, tallas profusas y tapizados densos.",
  },
  {
    name: "Industrial",
    description:
      "Estética de fábrica: acero visto, madera recuperada, estructura expuesta sin disimular.",
  },
  {
    name: "Brutalista",
    description:
      "Formas macizas y materiales crudos (hormigón, metal soldado), sin concesiones decorativas.",
  },
  {
    name: "Contemporáneo",
    description: "Diseño actual, sin adscripción a un movimiento histórico específico.",
  },
  {
    name: "Rústico",
    description:
      "Mobiliario de raíz campesina, maderas macizas sin refinar y construcción robusta.",
  },
  {
    name: "Art Nouveau",
    description:
      "Ornamentación orgánica de finales del siglo XIX, líneas curvas inspiradas en la naturaleza.",
  },
  {
    name: "Japandi",
    description:
      "Fusión contemporánea entre el minimalismo escandinavo y la estética japonesa: madera clara, líneas bajas y espacio en calma.",
  },
];

// Categorías planas (sin jerarquía) — cada una tendrá su propia página de
// categoría (ver Sprint 6-7). Las cuatro últimas se conservan de la
// taxonomía original por seguir siendo útiles para el catálogo.
const categories: Array<{ name: string; description: string }> = [
  {
    name: "Sofás",
    description: "Piezas de asiento colectivo, de autor y de anticuario.",
  },
  {
    name: "Mesas",
    description: "Mesas de centro, comedor y consolas de diseño y época.",
  },
  {
    name: "Sillas",
    description:
      "Sillas y sillones de autor, escandinavos, Art Déco e industriales.",
  },
  {
    name: "Escritorios",
    description: "Escritorios y mesas de trabajo de diseño y anticuario.",
  },
  {
    name: "Libreros",
    description: "Estanterías y libreros de autor y de época.",
  },
  {
    name: "Cómodas",
    description: "Cómodas y cajoneras de diseño y anticuario.",
  },
  {
    name: "Buffets",
    description: "Aparadores y buffets de mediados de siglo e industriales.",
  },
  {
    name: "Veladores",
    description: "Mesas auxiliares y veladores de diseño y colección.",
  },
  {
    name: "Iluminación",
    description: "Lámparas de pie, mesa y apliques de autor.",
  },
  {
    name: "Objetos de colección",
    description: "Piezas decorativas y objetos de colección verificados.",
  },
  {
    name: "Antigüedades",
    description: "Piezas de época con procedencia documentada.",
  },
  {
    name: "Textiles y alfombras",
    description: "Alfombras y textiles de autor y de anticuario.",
  },
];

const designers: Array<{
  name: string;
  countryIso: string;
  bio: string;
  content?: string;
}> = [
  {
    name: "Hans J. Wegner",
    countryIso: "DK",
    bio: "Diseñador danés conocido por sillas de líneas orgánicas y ebanistería depurada.",
    content:
      "Hans J. Wegner (1914–2007) diseñó más de 500 sillas a lo largo de su carrera, muchas de las cuales siguen en producción hoy. Formado como ebanista antes que como diseñador, su trabajo se caracteriza por una atención casi obsesiva al detalle constructivo — cada unión, cada curva, resuelta primero con las manos antes que en el papel.\n\nSu pieza más conocida, la Wishbone Chair (CH24, 1949), sigue fabricándose en Dinamarca por Carl Hansen & Søn con el mismo proceso artesanal de tejido de asiento en fibra de papel. Wegner también diseñó la Round Chair (1949), popularizada tras el debate televisado Kennedy-Nixon de 1960, lo que le valió el apodo informal de 'la silla' en la prensa estadounidense.",
  },
  {
    name: "Arne Jacobsen",
    countryIso: "DK",
    bio: "Arquitecto y diseñador danés, referente del funcionalismo escandinavo.",
  },
  {
    name: "Finn Juhl",
    countryIso: "DK",
    bio: "Pionero del diseño escandinavo de posguerra, conocido por su trabajo escultórico en madera.",
  },
  {
    name: "Charlotte Perriand",
    countryIso: "FR",
    bio: "Diseñadora francesa clave del modernismo, colaboradora habitual de Le Corbusier.",
  },
  {
    name: "Gio Ponti",
    countryIso: "IT",
    bio: "Arquitecto y diseñador italiano, figura central del diseño de posguerra en Italia.",
  },
  {
    name: "Børge Mogensen",
    countryIso: "DK",
    bio: "Diseñador danés discípulo de Kaare Klint, conocido por un funcionalismo austero y honesto en la construcción.",
    content:
      "Børge Mogensen (1914–1972) se formó como ebanista antes de estudiar bajo Kaare Klint en la Real Academia Danesa, donde interiorizó la idea de que el mobiliario debía partir de las proporciones del cuerpo humano y del uso real, no de la moda. Trabajó primero como director de diseño de FDB Møbler, la cooperativa de consumidores danesa, con el mandato explícito de crear mobiliario bien construido y asequible para familias corrientes — una postura deliberadamente opuesta al mueble de autor caro.\n\nSu pieza más reconocida hoy, la Spanish Chair (1958), nació de un viaje a España y su interés por las sillas de montar rurales; con el tiempo pasó de curiosidad de nicho a icono coleccionable producido por Fredericia Furniture. También diseñó el sofá Hunting/Jagtstolen y numerosas piezas de almacenaje modulares que anticiparon el mueble de sistema contemporáneo.",
  },
  {
    name: "Pierre Jeanneret",
    countryIso: "CH",
    bio: "Arquitecto suizo, primo y colaborador de Le Corbusier, célebre hoy por el mobiliario que diseñó para Chandigarh, India.",
    content:
      "Pierre Jeanneret (1896–1967) colaboró con su primo Le Corbusier y con Charlotte Perriand a fines de la década de 1920 en el desarrollo de mobiliario tubular de acero, incluida la icónica chaise longue LC4. Su capítulo más singular llegó en la década de 1950, cuando se trasladó a India para dirigir, junto a Le Corbusier, el diseño de Chandigarh, la nueva capital del Punjab planeada desde cero.\n\nPara equipar tribunales, universidades y viviendas de la ciudad, Jeanneret diseñó mobiliario en teca local y caña tejida —sillas, butacas y bancos de líneas geométricas simples, pensados para el clima y los talleres artesanales de la región—. Durante décadas ese mobiliario permaneció prácticamente anónimo dentro de los propios edificios de Chandigarh; desde los años 2000 ha sido redescubierto por el mercado del diseño vintage internacional y hoy se cuenta entre las piezas de posguerra más buscadas en subasta.",
  },
  {
    name: "Marcel Breuer",
    countryIso: "HU",
    bio: "Arquitecto y diseñador húngaro formado en la Bauhaus, pionero del mobiliario en tubo de acero.",
    content:
      "Marcel Breuer (1902–1981) llegó a la Bauhaus de Weimar como estudiante en 1920 y, hacia 1925, siendo ya jefe del taller de carpintería en la sede de Dessau, diseñó la silla Wassily: una estructura de tubo de acero doblado en frío, inspirada según él mismo relató en el manillar de su bicicleta, con correas de cuero tensadas en lugar de tapizado tradicional. Fue una de las primeras sillas modernas en usar tubo de acero como material estructural visible.\n\nEn 1928 presentó la Cesca Chair (modelo B32), que combinaba el mismo tubo de acero en voladizo —sin patas traseras— con un asiento y respaldo de rejilla de caña tejida a mano, logrando un objeto a la vez industrial y artesanal. Breuer emigró a Reino Unido y luego a Estados Unidos, donde desarrolló una extensa carrera como arquitecto, pero sus piezas de mobiliario de los años de la Bauhaus siguen en producción y son referencia obligada del diseño moderno.",
  },
  {
    name: "Poul Henningsen",
    countryIso: "DK",
    bio: "Diseñador y crítico danés, creador del sistema de lámparas PH que definió la iluminación escandinava del siglo XX.",
    content:
      "Poul Henningsen (1894–1967) dedicó buena parte de su carrera a resolver un problema muy concreto: la bombilla eléctrica desnuda producía una luz dura y deslumbrante. A partir de 1925 desarrolló el sistema de lámparas PH, compuesto por varias pantallas concéntricas calculadas geométricamente para redirigir toda la luz de forma indirecta y sin deslumbramiento, sea cual sea el ángulo de visión.\n\nEl resultado, producido desde entonces por Louis Poulsen, incluye modelos hoy omnipresentes en el diseño de interiores escandinavo como la PH5 (1958) y la PH Artichoke (1958), esta última compuesta por doce filas de hojas de metal superpuestas. Henningsen fue también un crítico cultural mordaz, y defendía que la iluminación era un problema social y no meramente decorativo.",
  },
  {
    name: "Charles y Ray Eames",
    countryIso: "US",
    bio: "Matrimonio de diseñadores estadounidenses, referentes del modernismo de posguerra y pioneros del contrachapado moldeado.",
    content:
      "Charles Eames (1907–1978) y Ray Eames (1912–1988) formaron uno de los estudios de diseño más influyentes del siglo XX, trabajando desde Los Ángeles en mobiliario, fotografía, exposiciones y cine. A comienzos de los años 40 desarrollaron técnicas propias de moldeado de contrachapado en tres dimensiones, primero para tablillas médicas durante la Segunda Guerra Mundial y luego para sillas como la LCW (Lounge Chair Wood).\n\nSu diseño más reconocido, el Eames Lounge Chair con su otomana (1956), combina cáscaras de contrachapado moldeado, cuero y una base giratoria de aluminio; fue concebido como una silla con 'la calidez de un guante de béisbol bien usado' y sigue fabricándose por Herman Miller en Estados Unidos y por Vitra bajo licencia en Europa, sin cambios sustanciales en su diseño original.",
  },
];

const manufacturers: Array<{
  name: string;
  countryIso: string;
  description: string;
}> = [
  {
    name: "Fritz Hansen",
    countryIso: "DK",
    description:
      "Manufactura danesa fundada en 1872, productora histórica de piezas de Arne Jacobsen y Hans J. Wegner.",
  },
  {
    name: "Carl Hansen & Søn",
    countryIso: "DK",
    description:
      "Ebanistería danesa fundada en 1908, conocida por producir la silla Wishbone de Wegner desde 1950.",
  },
  {
    name: "Knoll",
    countryIso: "US",
    description:
      "Manufactura estadounidense fundada en 1938, clave en la difusión del modernismo en América.",
  },
  {
    name: "Herman Miller",
    countryIso: "US",
    description:
      "Fabricante estadounidense fundado en 1905, pionero en diseño de oficina y mobiliario modernista.",
  },
  {
    name: "Cassina",
    countryIso: "IT",
    description:
      "Casa italiana fundada en 1927, reeditora autorizada de piezas de Le Corbusier y Gio Ponti.",
  },
  {
    name: "Vitra",
    countryIso: "CH",
    description:
      "Manufactura suiza fundada en 1950, licenciataria histórica de Eames y Jean Prouvé y editora de mobiliario de diseño moderno.",
  },
];

const decades: Array<{
  value: number;
  label: string;
  description: string;
  content?: string;
}> = [
  {
    value: 1920,
    label: "Años 1920",
    description: "Art Déco temprano y los últimos ecos del Art Nouveau.",
  },
  {
    value: 1930,
    label: "Años 1930",
    description: "Consolidación del Art Déco y primeros pasos del funcionalismo Bauhaus.",
  },
  {
    value: 1940,
    label: "Años 1940",
    description: "Escasez de posguerra y los primeros experimentos con madera contrachapada moldeada.",
  },
  {
    value: 1950,
    label: "Años 1950",
    description: "Explosión del diseño escandinavo y el modernismo estadounidense de posguerra.",
    content:
      "La década de 1950 marca el despegue internacional del diseño escandinavo. Con la reconstrucción de posguerra y una demanda creciente de mobiliario asequible pero bien hecho, talleres daneses y suecos perfeccionaron técnicas de contrachapado moldeado y producción en pequeña escala que hoy se consideran el estándar del 'buen diseño' de mediados de siglo.\n\nEn paralelo, en Estados Unidos, Herman Miller y Knoll llevaban al mercado masivo las propuestas de Charles y Ray Eames, consolidando un lenguaje visual optimista y funcional que definiría la década siguiente.",
  },
  {
    value: 1960,
    label: "Años 1960",
    description: "Apogeo del Mid-Century Modern y primeras señales del diseño pop.",
  },
  {
    value: 1970,
    label: "Años 1970",
    description: "Estética industrial, colores saturados y materiales sintéticos en auge.",
  },
  {
    value: 1980,
    label: "Años 1980",
    description: "Posmodernismo, geometrías audaces y el grupo Memphis como referencia.",
  },
  {
    value: 1990,
    label: "Años 1990",
    description: "Minimalismo y retorno a líneas depuradas tras los excesos posmodernos.",
  },
];

// Contenido investigado con fuentes reales (Wikipedia, Domus, museos,
// Wikimedia Commons para fotografía de licencia libre) — ver resumen de la
// feature "Tendencias" para el detalle de verificación de cada fuente e
// imagen. Ninguna estadística es inventada; donde no hay cifra exacta, el
// texto es cualitativo a propósito.
const trends: Array<{
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: TrendCategory;
  imageUrl: string;
  imageAlt: string;
  imageCredit?: string;
  materialSlug?: string;
  woodTypeSlug?: string;
  styleSlug?: string;
  designerSlug?: string;
  manufacturerSlug?: string;
  sourceUrl: string;
  sourceName: string;
}> = [
  {
    slug: "wishbone-chair-hans-wegner",
    title: "La Silla Wishbone: el icono atemporal de Hans J. Wegner",
    excerpt:
      "Diseñada en 1949 e inspirada en los retratos de los emperadores chinos sentados en sus tronos, la CH24 sigue naciendo hoy del mismo gesto artesanal con el que se creó hace más de setenta años.",
    body: "En 1949, Eivind Kold Christensen, responsable comercial del fabricante danés Carl Hansen & Søn, vio el trabajo de un joven ebanista llamado Hans J. Wegner en una exposición en Copenhague y le propuso diseñar en exclusiva para la firma. En apenas tres semanas, Wegner entregó cuatro modelos: la butaca CH22, la silla CH23, la silla CH25 y la CH24, la que con el tiempo se conocería como Wishbone Chair. Se lanzó al mercado en 1950 y no ha dejado de fabricarse desde entonces.\n\nLa silla forma parte de una serie que Wegner venía desarrollando desde los años cuarenta a partir de los retratos de mandarines y emperadores chinos sentados en sillas de respaldo circular, una tipología que el diseñador había ido depurando hasta reducirla a su expresión más esencial. El resultado es un respaldo curvo continuo sostenido por un travesaño central en forma de Y, el detalle que le da su nombre popular: Wishbone, «espoleta» o «hueso de la suerte».\n\nCada silla se compone de catorce piezas de madera maciza —hoy disponible en roble, haya, fresno o nogal, según el acabado— unidas mediante ensambles de espiga y caja tradicionales, un proceso que suma más de un centenar de pasos de producción. El asiento, en cambio, se resuelve con más de ciento veinte metros de cordón de papel certificado FSC, tejido a mano siguiendo un patrón en forma de sobre que un artesano tarda alrededor de una hora en completar.\n\nMás de setenta años después de su presentación, la CH24 sigue siendo uno de los símbolos más reconocibles del diseño danés de posguerra, presente por igual en comedores domésticos, restaurantes y espacios institucionales de todo el mundo. Su permanencia no responde a un golpe de nostalgia sino a una decisión de fabricación consciente: Carl Hansen & Søn nunca ha alterado el proceso artesanal original, y cada silla que sale de su taller en Dinamarca continúa llevando la firma de un tejido hecho a mano.",
    category: "ICONIC_PIECE",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/58/Hans_J_Wegner_Wishbone_Chair.jpg",
    imageAlt:
      "Silla Wishbone (CH24) de Hans J. Wegner en madera de haya torneada y encerada, con asiento tejido en cordón de papel trenzado, fotografiada sobre fondo neutro.",
    imageCredit: "Foto: Nasjonalmuseet / Frode Larsen, Wikimedia Commons, CC BY 4.0",
    woodTypeSlug: "haya",
    styleSlug: "mid-century-modern",
    designerSlug: "hans-j-wegner",
    manufacturerSlug: "carl-hansen-son",
    sourceUrl: "https://www.carlhansen.com/en/en/designers/hans-j-wegner/behind-an-icon-ch24",
    sourceName: "Carl Hansen & Søn",
  },
  {
    slug: "egg-chair-swan-chair-jacobsen",
    title: "Egg Chair y Swan Chair: la revolución escultórica de Arne Jacobsen",
    excerpt:
      "Creadas en 1958 para el vestíbulo del hotel SAS Royal de Copenhague, la Egg y la Swan demostraron que una butaca podía esculpirse como una pieza de escultura, liberada por primera vez de la madera.",
    body: "En 1956, la aerolínea escandinava SAS encargó a Arne Jacobsen el que se presentó como «el primer hotel de diseño del mundo»: el SAS Royal Hotel, una torre de veintidós plantas en el centro de Copenhague (hoy Radisson Collection Royal Hotel). Jacobsen no se limitó a proyectar el edificio: diseñó también el mobiliario, la iluminación, los textiles e incluso la cubertería, concibiendo el conjunto como una auténtica obra de arte total, un gesamtkunstwerk, para el vestíbulo y las zonas comunes.\n\nPara dar forma a la Egg y a la Swan, Jacobsen recurrió a una técnica entonces novedosa en el mobiliario danés: en lugar de partir de una estructura de madera y metal, esculpió las formas en espuma dura, como si trabajase la arcilla o el yeso, antes de desarrollar el proceso final junto a los técnicos de Fritz Hansen. Esta libertad escultórica, impensable con los métodos tradicionales de carpintería, es lo que permitió las curvas envolventes y asimétricas que definen ambas piezas.\n\nLa presentación de 1958 causó sensación inmediata: el diario danés Politiken describió el evento de lanzamiento en la fábrica de Fritz Hansen como «casi un desfile de moda, con focos, flashes de fotógrafos e invitados VIP». Desde entonces, ambas piezas han sufrido solo ajustes menores, siempre respetando el diseño original, y la Swan continúa fabricándose de forma ininterrumpida por Fritz Hansen.\n\nMás de sesenta años después, la Egg y la Swan siguen siendo sinónimo de modernidad escandinava: habituales en vestíbulos de hoteles, despachos y colecciones de museos de diseño, encarnan el momento en que el mobiliario danés dejó de estar atado a la carpintería tradicional para abrazar la escultura como método de trabajo.",
    category: "ICONIC_PIECE",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d3/Egg_chair_-_Arne_Jacobsen_%281958%29.jpg",
    imageAlt:
      "Butaca Egg Chair de Arne Jacobsen tapizada en cuero negro sobre base giratoria de aluminio, fotografiada en estudio sobre fondo neutro.",
    imageCredit: "Foto: Nasjonalmuseet, Wikimedia Commons, CC BY-SA 4.0",
    styleSlug: "mid-century-modern",
    designerSlug: "arne-jacobsen",
    manufacturerSlug: "fritz-hansen",
    sourceUrl: "https://www.iconeye.com/design/classic-egg-chair-arne-jacobsen-fritz-hansen",
    sourceName: "ICON Magazine",
  },
  {
    slug: "finn-juhl-escultura-en-madera",
    title: "Finn Juhl: la madera como escultura",
    excerpt:
      "Con la 45 Chair y la Chieftain Chair, Finn Juhl demostró que un asiento podía leerse como una escultura orgánica, y fue clave para que el diseño danés cruzara el Atlántico de la mano del MoMA.",
    body: "Finn Juhl debutó en 1937 en la Exposición del Gremio de Ebanistas de Copenhague junto al maestro ebanista Niels Vodder, con quien mantendría una colaboración de más de veinte años. A diferencia de otros diseñadores daneses de su generación, Juhl no era ebanista de formación —había estudiado historia del arte y arquitectura— y esa distancia le permitió abordar la madera con una libertad casi escultórica, ajena a la lógica estrictamente funcional del oficio.\n\nEsa aproximación cristalizó en 1945 con la 45 Chair, en la que el asiento y el respaldo parecen flotar, desligados del armazón de madera que los sostiene, rompiendo con la construcción tradicional en la que el tapizado se apoya directamente sobre la estructura. Cuatro años más tarde, en 1949, presentó su pieza más célebre, la Chieftain Chair, en la misma Exposición del Gremio de Ebanistas. Según cuenta la leyenda del propio estudio, cuando el rey Federico IX de Dinamarca se sentó en ella durante la inauguración, Juhl se negó a bautizarla como «silla del rey» y prefirió decir que estaba «pensada para algún jefe (chieftain)».\n\nEl salto internacional de Juhl llegó de la mano de Edgar Kaufmann Jr., director del departamento de diseño industrial del MoMA de Nueva York, que hacia 1950 y 1951 impulsó su obra en Estados Unidos a través de las muestras «Good Design» organizadas por el museo y el Merchandise Mart de Chicago. Ese respaldo condujo a uno de los encargos más simbólicos de su carrera: el diseño de la Sala del Consejo de Administración Fiduciaria de las Naciones Unidas en Nueva York, un proyecto que contribuyó decisivamente a instalar la etiqueta «Danish Modern» en el imaginario estadounidense.\n\nSu colaboración con Vodder terminó en 1957 y, en las décadas siguientes, la producción de sus piezas se redujo notablemente. Juhl murió en 1989, poco antes de que una gran retrospectiva en Japón reavivara el interés internacional por su obra. Hoy, la casa que gestiona su legado —House of Finn Juhl— sigue reeditando sus diseños originales, y piezas como la 45 Chair o la Chieftain Chair son referencia obligada en cualquier conversación sobre el mueble danés como escultura habitable.",
    category: "DESIGNER",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/79/Finn_Juhls_44-stol_%281944%29.JPG",
    imageAlt:
      "Silla 44 (1944) de Finn Juhl, con brazos y respaldo de madera de líneas curvas y orgánicas y asiento tapizado en cuero color camel.",
    imageCredit: "Foto: Tjalland, Wikimedia Commons, CC BY-SA 3.0",
    styleSlug: "mid-century-modern",
    designerSlug: "finn-juhl",
    sourceUrl: "https://finnjuhl.com/about/timeline",
    sourceName: "House of Finn Juhl",
  },
  {
    slug: "spanish-chair-borge-mogensen",
    title: "La Spanish Chair de Børge Mogensen: memoria de un viaje andaluz",
    excerpt:
      "Nacida de un viaje por Andalucía en los años cincuenta, la Spanish Chair de Børge Mogensen tradujo la silla de montar española a la sobriedad del mobiliario danés.",
    body: "Børge Mogensen, diseñador fundador de Fredericia Furniture, encontró la semilla de una de sus piezas más reconocibles lejos de Dinamarca: durante un viaje familiar por Andalucía, quedó fascinado por las sillas de construcción medieval española, de brazos anchos y asiento y respaldo de cuero tensado. A su regreso, reinterpretó esa tipología con el vocabulario depurado del diseño escandinavo, y el resultado se presentó en 1958 en la Exposición del Gremio de Ebanistas de Copenhague, en una muestra en la que, de forma deliberada, se retiraron todas las mesas para crear un espacio de estar completamente abierto.\n\nLa Spanish Chair combina una estructura de madera maciza —roble o nogal, según el acabado— con un asiento y respaldo de cuero curtido vegetal, sujetos mediante hebillas y correas metálicas que permiten tensar la piel a medida que esta se estira con el uso. El cuero procede de la curtiduría sueca Tärnsjö Garveri, una de las pocas que en el mundo sigue empleando el curtido vegetal tradicional, un proceso más lento pero que produce una piel que envejece con carácter propio.\n\nLa pieza resume bien la filosofía de Mogensen, para quien el mueble debía transmitir sobriedad y perdurar generaciones antes que deslumbrar por su ornamento. No hay artificio en la Spanish Chair: su construcción es visible, sus materiales se declaran sin disimulo y su superficie de cuero, lejos de ocultarse, está pensada para desarrollar pátina con el paso del tiempo y el roce del uso diario.\n\nDécadas después de su presentación, la Spanish Chair sigue en el catálogo de Fredericia Furniture, y se ha convertido en una de las referencias más citadas cuando se habla de cómo el diseño danés de mediados del siglo XX dialogó con tradiciones artesanales de fuera de Escandinavia sin perder su identidad.",
    category: "ICONIC_PIECE",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/cf/B%C3%B8rge_Mogensen_-_Spannish_chair.jpg",
    imageAlt:
      "Butaca Spanish Chair de Børge Mogensen, con estructura de madera clara, asiento y respaldo de cuero curtido en tono coñac y correas de sujeción visibles, expuesta en el Designmuseum Danmark.",
    imageCredit: "Foto: Ramblersen, Wikimedia Commons, CC BY-SA 3.0",
    woodTypeSlug: "roble",
    styleSlug: "mid-century-modern",
    designerSlug: "borge-mogensen",
    sourceUrl: "https://www.fredericia.com/product/the-spanish-chair-2226",
    sourceName: "Fredericia Furniture",
  },
  {
    slug: "ph-lamps-poul-henningsen",
    title: "Las lámparas PH de Poul Henningsen: la luz sin deslumbramiento",
    excerpt:
      "Obsesionado desde joven con la calidad de la luz, Poul Henningsen ideó un sistema de pantallas superpuestas que, un siglo después, sigue siendo la referencia para iluminar sin deslumbrar.",
    body: "Poul Henningsen (1894-1967) creció rodeado de la luz cálida y difusa de las lámparas de aceite y vivió con recelo la llegada de la bombilla eléctrica desnuda, que consideraba una fuente de luz agresiva y mal resuelta. Esa incomodidad con el deslumbramiento eléctrico lo llevó a dedicar buena parte de su carrera, primero como escritor y crítico y después como diseñador, a investigar cómo controlar y suavizar la luz artificial sin renunciar a su eficacia.\n\nEl resultado de esa investigación, desarrollada junto al fabricante Louis Poulsen a partir de mediados de los años veinte, fue el sistema de pantallas PH: varias pantallas curvas y concéntricas, calculadas geométricamente, que ocultan la bombilla desde cualquier ángulo de visión mientras reflejan y redirigen la luz hacia abajo y hacia los lados. El objetivo no era solo evitar el deslumbramiento directo, sino lograr una luz repartida de forma uniforme y agradable, sin sombras duras ni puntos de luz agresivos.\n\nEn 1958, Henningsen presentó dos de sus diseños más recordados. La PH5, con su característico perfil piramidal de pantallas superpuestas, resolvía un problema práctico: los cambios en el tamaño y la forma de las bombillas incandescentes alteraban el comportamiento óptico de los modelos PH anteriores, así que la PH5 se diseñó para mantener una luz uniforme y libre de deslumbramiento con independencia del tipo de bombilla instalada. Ese mismo año, para el restaurante del pabellón Langelinie de Copenhague, ideó la PH Artichoke, una lámpara compuesta por hileras escalonadas de láminas metálicas dispuestas en torno a una estructura de brazos de acero, de manera que ninguna pantalla bloquea a la de al lado y la luz se filtra suave desde cualquier punto de la sala.\n\nPocos diseñadores de iluminación han sido tan copiados como Henningsen, y sus lámparas PH —hoy fabricadas por Louis Poulsen— siguen presentes en hogares, restaurantes e instituciones danesas como una suerte de estándar tácito de buena iluminación doméstica, más de sesenta años después de su creación.",
    category: "ICONIC_PIECE",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/46/Louis_Poulsen_PH5_Poul_Hennigsen.jpg",
    imageAlt:
      "Lámpara colgante PH5 de Poul Henningsen encendida, mostrando su característico sistema de pantallas blancas superpuestas con un acento azul en el interior.",
    imageCredit: "Foto: Richard Huber, Wikimedia Commons, CC BY-SA 3.0",
    styleSlug: "mid-century-modern",
    designerSlug: "poul-henningsen",
    sourceUrl: "https://www.louispoulsen.com/en-us/catalog/private/pendants/ph-5",
    sourceName: "Louis Poulsen",
  },
  {
    slug: "diseno-escandinavo-auge",
    title: "Por qué el diseño escandinavo no pasa de moda",
    excerpt:
      "Décadas después de su apogeo, las piezas escandinavas de mediados del siglo XX siguen ganando terreno entre coleccionistas e interioristas, sostenidas por un relato de artesanía, durabilidad y atemporalidad que conecta con las prioridades actuales.",
    body: "El interés por el diseño escandinavo de mediados del siglo XX no ha dejado de crecer en el mercado del mueble vintage y de colección. Lo que durante años se centró casi en exclusiva en los grandes nombres del diseño danés se ha ido ampliando hacia la producción sueca, noruega y finlandesa de la misma época, con firmas y diseñadores menos conocidos internacionalmente que hoy despiertan un interés creciente entre coleccionistas y anticuarios especializados.\n\nParte de ese atractivo se explica por la calidad constructiva de las piezas originales. El mobiliario escandinavo de posguerra se caracteriza por ensamblajes de madera maciza a la vista, sin artificios que oculten cómo está construida cada pieza, y por el uso de materiales naturales —madera, cuero, lana, latón— elegidos tanto por su desempeño como por su capacidad de envejecer con dignidad. Esa honestidad constructiva, pensada en su origen para durar generaciones, es hoy uno de los argumentos más repetidos por quienes defienden comprar vintage frente a mobiliario de producción masiva.\n\nA ese argumento de durabilidad se suma, en los últimos años, una lectura más consciente sobre el consumo: adquirir una pieza de los años cincuenta o sesenta que sigue funcionando y envejeciendo bien se percibe cada vez más como una alternativa sostenible frente a la compra de mobiliario nuevo de vida corta. La pátina, las marcas de uso y la trazabilidad de una pieza con historia —quién la diseñó, quién la fabricó, en qué década— se han convertido en parte del valor mismo del objeto, no en un defecto que haya que disimular.\n\nA todo ello se añade la vigencia del lenguaje formal escandinavo: líneas depuradas, proporciones cuidadas y una calidez que evita tanto el exceso ornamental como la frialdad de cierto minimalismo contemporáneo. Es un estilo que combina con facilidad tanto en interiores clásicos como en espacios muy actuales, lo que explica que interioristas y compradores particulares sigan integrando piezas originales —o reediciones fieles— en proyectos que poco tienen que ver estéticamente con la Dinamarca o la Suecia de los años cincuenta.\n\nEl resultado es un mercado que, sin los sobresaltos de las modas pasajeras, mantiene una demanda sostenida y de fondo: firmas, casas de subastas y tiendas especializadas coinciden en que las piezas escandinavas de mediados de siglo, lejos de agotarse como tendencia, se han consolidado como una categoría estable dentro del coleccionismo de diseño.",
    category: "MARKET",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/50/Danish_Design_Museum_-_furniture_exhibition.jpg",
    imageAlt:
      "Sala de exposición del Designmuseum Danmark en Copenhague con una selección de sillas y sofás escandinavos de mediados del siglo XX dispuestos sobre plataformas.",
    imageCredit: "Foto: Jay Sobel, Wikimedia Commons, dominio público",
    styleSlug: "escandinavo",
    sourceUrl: "https://www.pamono.com/stories/field-notes-vintage-swedish-design",
    sourceName: "Pamono Stories",
  },
  {
    slug: "cesca-chair-marcel-breuer",
    title: "La silla Cesca: el Bauhaus sentado en acero tubular",
    excerpt:
      "Marcel Breuer encontró en el manillar de su bicicleta la inspiración para una silla que cambiaría para siempre el mobiliario moderno. Casi un siglo después, Knoll sigue fabricándola tal y como él la concibió.",
    body: "En 1928, en pleno auge de la Bauhaus, el arquitecto y diseñador húngaro Marcel Breuer presentó un modelo de silla que rompía con siglos de carpintería tradicional: un armazón de acero tubular curvado en voladizo, sin patas traseras, sobre el que se tensaba un asiento y un respaldo de rejilla de caña tejida a mano. Breuer explicó en su día que la idea le vino del tubo de acero de su propia bicicleta, un material industrial hasta entonces ajeno al mundo del mueble doméstico. El modelo se catalogó originalmente como B32.\n\nLa pieza fue bautizada más tarde como Cesca en homenaje a Francesca, la hija adoptiva de Breuer, y con ese nombre es como se la conoce hoy en el catálogo de Knoll. Su construcción representa una síntesis muy propia de la Bauhaus: por un lado la lógica de la producción industrial y la repetición en serie que permitía el tubo de acero curvado; por otro, el oficio artesanal del tejido de caña, heredado de la tradición centroeuropea del mueble Thonet, que Breuer decidió conservar en lugar de sustituir por un material sintético.\n\nLa silla pasó por varios fabricantes a lo largo del siglo XX: Thonet la produjo desde finales de los años veinte, la italiana Gavina la reeditó en los años cincuenta, y quien terminó adquiriendo los derechos y la producción con licencia fue Knoll, que la incorporó a su catálogo en 1968 tras comprar Gavina. Desde entonces se fabrica de forma ininterrumpida, y una unidad original de 1928 forma parte de la colección permanente del MoMA de Nueva York, donde ha sido citada por sus conservadores como una de las sillas más influyentes del siglo XX.\n\nMás allá de su valor histórico, la Cesca sigue siendo hoy una de las piezas más reconocibles del diseño moderno por una razón muy simple: no ha necesitado cambiar. El contraste entre la frialdad del metal y la calidez orgánica de la caña, y esa sensación de ligereza que produce el voladizo sin patas traseras, siguen resultando tan sorprendentes como en 1928.",
    category: "ICONIC_PIECE",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Breuer_chair_2008.jpg",
    imageAlt:
      "Silla Cesca de Marcel Breuer, con estructura de acero tubular en voladizo y asiento y respaldo de rejilla de caña tejida",
    imageCredit: "Foto: Holger.Ellgaard / Wikimedia Commons, CC BY-SA 3.0",
    styleSlug: "bauhaus",
    designerSlug: "marcel-breuer",
    manufacturerSlug: "knoll",
    sourceUrl: "https://en.wikipedia.org/wiki/Cesca_chair",
    sourceName: "Wikipedia",
  },
  {
    slug: "eames-lounge-chair",
    title: "Eames Lounge Chair: el sillón que quiso parecer un guante de béisbol usado",
    excerpt:
      "Charles y Ray Eames diseñaron en 1956 su primera pieza pensada para un público de alto standing, y desde entonces no ha dejado de fabricarse. Es, probablemente, la butaca más reconocible del diseño del siglo XX.",
    body: "Cuando Charles y Ray Eames presentaron su Lounge Chair and Ottoman en directo, en el programa Home de la cadena NBC en 1956, llevaban ya más de una década experimentando con el contrachapado moldeado en tres dimensiones, un proceso que habían perfeccionado durante la Segunda Guerra Mundial fabricando entablillados médicos y piezas para la aviación. La butaca fue, sin embargo, su primer diseño concebido explícitamente para un mercado de gama alta, alejado de las piezas más asequibles con las que se habían dado a conocer.\n\nCharles Eames resumió la ambición del proyecto con una imagen muy suya: quería que la silla tuviera «el aspecto cálido y acogedor de un guante de béisbol ya usado». El resultado fueron tres cáscaras de contrachapado curvado —reposacabezas, respaldo y asiento— revestidas originalmente de chapa de palisandro de Brasil, tapizadas en cuero y suspendidas sobre una base giratoria de aluminio pulido. La referencia formal, reconocida por los propios diseñadores, era el clásico sillón club inglés, reinterpretado con los medios de producción industrial de mediados del siglo XX.\n\nLa pieza se fabrica desde su lanzamiento de forma ininterrumpida por Herman Miller en Estados Unidos —con Vitra produciéndola bajo licencia para el mercado europeo—, algo poco habitual en el diseño de mobiliario y que la ha convertido en un raro caso de objeto contemporáneo con estatus de clásico instantáneo y vigente a la vez. En 1960 entró a formar parte de la colección permanente del MoMA de Nueva York, donada por Herman Miller.\n\nSu éxito comercial y su presencia constante en despachos, salones y platós de televisión —de series a portadas de revistas— también la convirtió, ya en los años sesenta, en una de las piezas de diseño más copiadas de la historia, hasta el punto de que los propios Eames tuvieron que advertir públicamente sobre las falsificaciones que circulaban por el mercado. Ese mismo nivel de imitación es, en cierto modo, la prueba más clara de hasta qué punto logró convertirse en arquetipo.",
    category: "ICONIC_PIECE",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/e/e8/Ngv_design%2C_charles_eames_and_herman_miller%2C_lounge_chair_670%2C_1956.JPG",
    imageAlt:
      "Eames Lounge Chair modelo 670, con cáscaras de contrachapado moldeado, tapizado de cuero y base giratoria de aluminio, expuesta en la National Gallery of Victoria",
    imageCredit: "Foto: Sailko / Wikimedia Commons, CC BY-SA 3.0",
    styleSlug: "mid-century-modern",
    designerSlug: "charles-y-ray-eames",
    manufacturerSlug: "herman-miller",
    sourceUrl: "https://en.wikipedia.org/wiki/Eames_Lounge_Chair",
    sourceName: "Wikipedia",
  },
  {
    slug: "pierre-jeanneret-chandigarh",
    title: "Del mobiliario de oficina de Chandigarh al mercado del coleccionismo",
    excerpt:
      "Las sillas y bancos de teca que Pierre Jeanneret diseñó para equipar los edificios administrativos de la ciudad india de Chandigarh fueron durante décadas mobiliario funcional y anónimo. Hoy se subastan como piezas de autor.",
    body: "A comienzos de los años cincuenta, el arquitecto suizo Pierre Jeanneret —primo de Le Corbusier y su socio habitual de estudio— se trasladó a India para dirigir sobre el terreno la construcción de Chandigarh, la nueva capital del Punjab planificada por Le Corbusier tras la partición del país. Jeanneret permaneció allí durante más de una década, y además de supervisar la obra arquitectónica asumió el diseño de buena parte del mobiliario que debía equipar tribunales, universidades, viviendas y oficinas administrativas de la ciudad.\n\nPara ese mobiliario, Jeanneret recurrió a materiales y mano de obra locales: teca maciza, resistente a la humedad y a los insectos del clima del Punjab, combinada con asientos y respaldos de caña o cuerda tejida por artesanos de la región. El resultado fueron sillas, sillones, bancos y mesas de líneas geométricas muy depuradas —hoy agrupadas bajo el nombre genérico de «sillas de Chandigarh»— concebidas como mobiliario público funcional y prácticamente anónimo, sin firma ni pretensión alguna de convertirse en objeto de diseño.\n\nDurante décadas, estas piezas permanecieron en los mismos edificios para los que fueron creadas, sufriendo el desgaste propio del uso institucional. La revalorización llegó de forma tardía: fue a partir de finales de los años noventa y sobre todo en la década de 2000 cuando marchantes y coleccionistas europeos comenzaron a rastrear Chandigarh en busca de estas piezas, adquiriendo por precios muy bajos mobiliario que las propias instituciones indias estaban renovando o desechando. Desde ahí, el circuito de galerías y casas de subastas internacionales impulsó una demanda creciente que disparó su cotización.\n\nEste fenómeno ha generado también una controversia de fondo: gran parte de ese mobiliario salió de India sin que existiera entonces un marco claro de protección patrimonial, lo que llevó a las autoridades indias a restringir posteriormente su exportación. El resultado es una paradoja habitual en la historia del diseño: un mobiliario pensado como anónimo y utilitario, hecho para servir a una utopía urbanística colectiva, terminó siendo reclasificado como obra de autor de coleccionista en las principales ferias y subastas de diseño del siglo XXI.",
    category: "ICONIC_PIECE",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/d/d8/Pierre-Jeanneret-PJ-SI-29A-Armchair-P-Galerie-Zurich.jpg",
    imageAlt:
      "Sillón PJ-SI-29A original de Pierre Jeanneret para Chandigarh, en teca maciza con asiento y respaldo de caña tejida",
    imageCredit: "Foto: P! Galerie Zúrich (usuario Phadzim) / Wikimedia Commons, CC BY 4.0",
    woodTypeSlug: "teca",
    styleSlug: "mid-century-modern",
    designerSlug: "pierre-jeanneret",
    sourceUrl: "https://en.wikipedia.org/wiki/Chandigarh_chair",
    sourceName: "Wikipedia",
  },
  {
    slug: "charlotte-perriand-y-le-corbusier",
    title: "Charlotte Perriand, la firma que faltaba en las siglas LC",
    excerpt:
      "Durante décadas, las sillas de acero tubular que Charlotte Perriand desarrolló en el estudio de Le Corbusier se atribuyeron casi en exclusiva a este último. Su verdadera autoría solo se ha reconocido plenamente en años recientes.",
    body: "Charlotte Perriand (París, 1903-1999) se formó en la École de l'Union Centrale des Arts Décoratifs y comenzó su carrera dentro de la estética Art Déco. Su punto de inflexión llegó en 1927, cuando presentó en el Salón de Otoño de París «Bar sous le toit», la reconstrucción de un rincón de su propio apartamento amueblado con aluminio, cristal y cromados, una instalación que llamó la atención de Le Corbusier. La leyenda cuenta que este la rechazó primero con la frase «aquí no bordamos cojines», antes de contratarla poco después al ver su trabajo en persona.\n\nEntre 1927 y 1937, Perriand trabajó en el estudio de Le Corbusier junto a su primo y socio Pierre Jeanneret, encargándose específicamente de lo que en el taller llamaban «l'équipement intérieur de l'habitation», el equipamiento interior de la vivienda. Fue en ese periodo cuando los tres desarrollaron la serie de mobiliario en acero tubular que hoy se conoce por sus siglas LC: el sillón basculante, el «Grand Confort» y la chaise longue reclinable, presentada en el Salón de Otoño de 1929 con una fotografía célebre de la propia Perriand tumbada sobre ella. Se le reconoce además el mérito de haber introducido el acero tubular como material de trabajo en el estudio.\n\nA pesar de su papel central en el desarrollo de estas piezas, la autoría se atribuyó casi siempre a Le Corbusier, con Jeanneret y Perriand mencionados como colaboradores secundarios cuando se les mencionaba. La propia Perriand relató en su autobiografía de 1991 que era ella quien debía «dar vida» al mobiliario a partir de las ideas del arquitecto, y llegó a declarar en una entrevista de 1984 que la confusión sobre la autoría no le preocupaba especialmente.\n\nEl reconocimiento formal ha llegado con mucho retraso respecto a su trabajo. En 2022, Cassina —fabricante bajo licencia de la serie desde los años sesenta— decidió retirar la denominación «LC4» del nombre comercial de la chaise longue, precisamente para corregir la confusión histórica sobre su autoría y visibilizar el papel de Perriand en su diseño. Ese gesto se ha sumado a una revisión más amplia, con grandes retrospectivas museísticas en la última década, que sitúan a Perriand no como colaboradora de Le Corbusier sino como una de las figuras centrales del mobiliario moderno del siglo XX por derecho propio.",
    category: "DESIGNER",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6d/LC4_Chair_by_Le_Corbusier_and_Perriand_1927-28.jpg",
    imageAlt:
      "Estructura de la chaise longue LC4, diseñada por Charlotte Perriand junto a Le Corbusier y Pierre Jeanneret, expuesta en el Museo de Artes Decorativas de París",
    imageCredit: "Foto: SiefkinDR / Wikimedia Commons, CC BY-SA 4.0",
    designerSlug: "charlotte-perriand",
    manufacturerSlug: "cassina",
    sourceUrl: "https://www.elledecoration.co.uk/design/people/a64476960/charlotte-perriand-4-chaise-longue-real-story/",
    sourceName: "Elle Decoration UK",
  },
  {
    slug: "diseno-italiano-gio-ponti-cassina",
    title: "Gio Ponti, Domus y el peso justo del diseño italiano",
    excerpt:
      "Arquitecto, diseñador y fundador de la revista Domus, Gio Ponti definió buena parte de lo que hoy entendemos por diseño italiano de posguerra. Su silla Superleggera, fabricada por Cassina, sigue siendo su manifiesto más contundente.",
    body: "Gio Ponti (Milán, 1891-1979) fue arquitecto, diseñador industrial, decorador y editor, y esa combinación de oficios es en buena medida lo que explica su influencia decisiva sobre el diseño italiano del siglo XX. En 1928 fundó la revista Domus, que dirigió durante gran parte de su vida y que convirtió en la plataforma principal desde la que Italia proyectó al mundo su propia idea de modernidad doméstica: arquitectura, interiorismo, artes decorativas y objetos de uso cotidiano tratados con el mismo rigor crítico que el arte.\n\nSu pieza más conocida, la silla Superleggera, resume ese enfoque. Ponti llevaba años dando vueltas a la silla tradicional de Chiavari, un modelo ligero de la tradición ligur que había equipado durante generaciones los comedores italianos, y a partir de esa referencia popular desarrolló entre 1955 y 1957 una silla despojada de todo lo superfluo: patas de perfil triangular en lugar de redondo, estructura de fresno muy fina y asiento de rejilla de paja, hasta lograr un peso extraordinariamente reducido para una silla de madera maciza. Según la propia leyenda del estudio, para demostrar su resistencia se llegó a lanzar el prototipo desde varios pisos de altura sin que se rompiera.\n\nLa Superleggera salió al mercado en 1957 fabricada por Cassina, la casa milanesa que desde los años cincuenta se especializó en llevar a producción en serie, bajo licencia y con el visto bueno de sus autores, el trabajo de los grandes nombres del movimiento moderno. Su éxito comercial fue tan inmediato que Cassina se vio obligada, ya en 1960, a publicar un aviso en las páginas de la propia Domus advirtiendo de que la «Leggera» y la «Superleggera» eran de su producción exclusiva, señal de que las imitaciones habían empezado a circular casi de inmediato.\n\nEsa alianza entre diseñador y fabricante —Ponti aportando la idea depurada hasta el límite, Cassina resolviendo su producción industrial a gran escala— es precisamente el modelo que terminó definiendo al diseño italiano de posguerra como categoría reconocible en todo el mundo, y explica por qué Cassina sigue presentándose hoy como guardiana de un archivo de piezas que reeditan, con autorización de sus herederos, a los grandes maestros del movimiento moderno europeo.",
    category: "DESIGN",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/9c/Gio_ponti_per_cassina%2C_sedia_superleggera%2C_1957.JPG",
    imageAlt:
      "Silla Superleggera de Gio Ponti para Cassina, 1957, con estructura de madera de perfil triangular y asiento de rejilla de paja, expuesta en el Museo del Mobile de Milán",
    imageCredit: "Foto: Sailko / Wikimedia Commons, CC BY 3.0",
    woodTypeSlug: "fresno",
    styleSlug: "mid-century-modern",
    designerSlug: "gio-ponti",
    manufacturerSlug: "cassina",
    sourceUrl: "https://www.domusweb.it/en/design/2026/02/11/gio-ponti-superleggera-chair-design-story.html",
    sourceName: "Domus",
  },
  {
    slug: "herman-miller-de-oficina-a-icono",
    title: "Herman Miller: de fabricante de dormitorios a laboratorio del diseño moderno",
    excerpt:
      "Antes de convertirse en sinónimo de diseño moderno americano, Herman Miller era una modesta empresa de muebles de dormitorio en Michigan. Su transformación se debió a una apuesta consciente por el talento de sus diseñadores.",
    body: "La historia de Herman Miller empieza lejos del diseño moderno que hoy le da nombre. La compañía nació en 1905 en Zeeland, Michigan, como Star Furniture Company, dedicada a muebles de dormitorio de estilo tradicional e historicista, muy alejados de cualquier vocación innovadora. D. J. De Pree entró a trabajar allí como empleado en 1909 y fue ascendiendo hasta la presidencia; en 1923, tras convencer a su suegro Herman Miller de comprar la mayoría de las acciones, rebautizó la empresa con su nombre.\n\nEl giro decisivo llegó con la Gran Depresión. En 1930, el diseñador neoyorquino Gilbert Rohde se presentó en las oficinas de la compañía con un mensaje que entonces resultaba arriesgado: abandonar las reproducciones de estilos históricos y apostar por el mobiliario moderno, modular y funcional. De Pree aceptó el reto, y los primeros diseños de Rohde se presentaron en la Feria Mundial de Chicago de 1933, con buena acogida tanto del público como de los compradores comerciales. Fue el primer paso de una transformación que ya no se detendría.\n\nTras la muerte de Rohde en 1944, De Pree encontró a su sucesor de una manera casi casual: leyendo un reportaje sobre el diseñador George Nelson en la revista Life. Lo contrató como primer director de diseño de la empresa, y fue Nelson quien, junto con De Pree, atrajo hacia Herman Miller a Charles y Ray Eames, con quienes la compañía firmó en 1946 un acuerdo para producir y distribuir en exclusiva su mobiliario de contrachapado moldeado. A ese núcleo se sumarían con los años otros nombres decisivos del diseño de posguerra, como Isamu Noguchi o Alexander Girard, y de esa etapa surgieron piezas que hoy son referencia obligada de cualquier historia del diseño del siglo XX, desde la silla de fibra de vidrio de los Eames hasta el sistema modular Action Office, considerado un precedente directo del cubículo de oficina moderno.\n\nEsa apuesta inicial por el talento de diseñador por encima del catálogo genérico es, en el fondo, el rasgo que sigue definiendo a la compañía. Salió a bolsa en 1970 y continuó ampliando su presencia internacional en las décadas siguientes, y en 2021 protagonizó uno de los movimientos más comentados de la industria del mueble al adquirir Knoll —fabricante, entre otras piezas, de la Cesca de Breuer o el mobiliario de Mies van der Rohe— y pasar a operar bajo el nombre conjunto de MillerKnoll, consolidando bajo un mismo grupo buena parte del legado del diseño moderno americano del siglo XX.",
    category: "MANUFACTURER",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/ce/Aeron_chair_Brooklyn_Museum.jpg",
    imageAlt:
      "Silla de oficina Aeron de Herman Miller expuesta en el Brooklyn Museum, con estructura de malla tensada y base de aluminio",
    imageCredit: "Foto: Brooklyn Museum / Wikimedia Commons, CC BY 3.0",
    manufacturerSlug: "herman-miller",
    sourceUrl: "https://www.hermanmiller.com/about/timeline/",
    sourceName: "Herman Miller",
  },
  {
    slug: "mid-century-modern-vigencia",
    title: "Mid-Century Modern: por qué sigue siendo el estilo más codiciado del mercado vintage",
    excerpt:
      "Casi ochenta años después de su apogeo, el diseño de mediados de siglo sigue marcando el pulso del mercado del coleccionismo y las reediciones. Ferias, casas de subastas y una nueva generación de compradores mantienen viva su demanda.",
    body: "El Mid-Century Modern —el lenguaje formal que floreció aproximadamente entre 1945 y 1965 de la mano de Charles y Ray Eames, Hans J. Wegner, Arne Jacobsen o Florence Knoll— continúa siendo la categoría más activa dentro del mercado de mobiliario vintage y de coleccionista. Su combinación de líneas depuradas, funcionalidad y materiales nobles como el nogal, la teca o el palisandro le ha permitido trascender modas pasajeras y consolidarse como un valor prácticamente permanente en salas de subastas, ferias de anticuarios y plataformas especializadas en diseño de autor.\n\nUna de las razones de esta vigencia es la autenticidad como criterio de valor. Piezas originales firmadas por Wegner o los Eames, producidas por fabricantes como Fritz Hansen, Carl Hansen & Søn o Herman Miller, mantienen una demanda sostenida entre coleccionistas, que valoran el sello del fabricante y la procedencia por encima de la réplica. Al mismo tiempo, las propias casas —Herman Miller, Knoll, Fritz Hansen o Cassina— han mantenido en catálogo activo modelos diseñados hace más de setenta años, señal inequívoca de que la demanda comercial no ha decaído.\n\nFerias como el Salone del Mobile de Milán, Design Miami o las grandes citas de anticuarios europeos dedican secciones cada vez más visibles al diseño de posguerra, mientras que casas de subastas como Wright, Phillips o Christie's Design mantienen catálogos recurrentes centrados en esta época. El interés no se limita a coleccionistas veteranos: una generación más joven de compradores, sensibilizada con la sostenibilidad y el consumo consciente, encuentra en el mobiliario vintage una alternativa duradera frente al mueble de producción masiva, lo que ha ampliado la base de demanda sin diluir el prestigio de las piezas históricas.\n\nEn el mercado del interiorismo contemporáneo, el Mid-Century Modern funciona además como denominador común: convive con estilos tan distintos como el escandinavo, el industrial o el japandi, y sigue siendo la referencia obligada cuando se habla de mobiliario atemporal. Esa capacidad de integrarse en contextos muy diversos, unida a la solidez de su legado de diseño y a la calidad constructiva de las piezas originales, explica por qué el Mid-Century Modern no se percibe hoy como una moda retro sino como un clásico consolidado del diseño del siglo XX.",
    category: "MARKET",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/1/19/Mid-Century_Modern_Tripod_Lamp_at_Intterno_Showroom_in_Warsaw.jpg",
    imageAlt:
      "Lámpara trípode Mid-Century Modern en un showroom de mobiliario vintage, sobre una consola de madera oscura",
    imageCredit: "Foto: Siarhei V / Wikimedia Commons, CC BY-SA 4.0",
    styleSlug: "mid-century-modern",
    designerSlug: "charles-y-ray-eames",
    sourceUrl: "https://journalofantiques.com/collector-guides/mid-century-modern-furniture-guide/",
    sourceName: "Journal of Antiques and Collectibles",
  },
  {
    slug: "bauhaus-herencia-cien-anos",
    title: "Bauhaus: la herencia de una escuela que cambió para siempre el diseño de mobiliario",
    excerpt:
      "Fundada en Weimar en 1919 y cerrada por el régimen nazi en 1933, la Bauhaus condensó en apenas catorce años una revolución cuyo principio —la forma sigue a la función— sigue vertebrando el diseño de muebles contemporáneo.",
    body: "La Bauhaus nació el 1 de abril de 1919 en Weimar (Alemania) por iniciativa del arquitecto Walter Gropius, quien concibió una escuela donde artes, artesanía e industria dejaran de estar separadas. A lo largo de sus catorce años de existencia, la institución pasó por tres sedes y tres direcciones: Gropius en Weimar (1919-1925) y los primeros años en Dessau, Hannes Meyer (1928-1930) y, finalmente, Ludwig Mies van der Rohe, quien la trasladó a Berlín en 1932 antes de que la propia dirección decidiera cerrarla en 1933 ante la presión del régimen nazi, que consideraba la escuela un foco de intelectualismo subversivo.\n\nEl principio que mejor resume su legado —la forma sigue a la función— no debe entenderse como una simple consigna de austeridad, sino como una manera de pensar el objeto cotidiano en relación con quien lo usa. En el taller de ebanistería de Dessau, dirigido por Marcel Breuer entre 1924 y 1928, esa filosofía cristalizó en piezas que redefinieron el mobiliario del siglo XX: la silla Wassily (1925-1926), primera silla de tubo de acero curvado de la historia, inspirada según la leyenda en el cuadro de bicicleta del propio Breuer, o la silla Cesca, que combinaba acero tubular con asiento de rejilla de caña.\n\nEl edificio de la Bauhaus en Dessau, proyectado por Gropius entre 1925 y 1926, es hoy Patrimonio de la Humanidad por la UNESCO y sigue siendo el ejemplo arquitectónico más elocuente de esos principios: volúmenes limpios, grandes superficies acristaladas y una relación directa entre estructura y función que anticipó buena parte de la arquitectura moderna del siglo XX.\n\nAunque la escuela cerró hace más de noventa años, su influencia se expandió precisamente a través de la diáspora de sus profesores y alumnos, muchos de los cuales emigraron a Estados Unidos y allí formaron a nuevas generaciones de arquitectos y diseñadores. La combinación de rigor geométrico, honestidad de materiales y vocación por la producción en serie sigue reconociéndose hoy en el mobiliario contemporáneo, y explica por qué marcas como Knoll o Vitra continúan reeditando piezas nacidas en aquellos talleres de Weimar, Dessau y Berlín.",
    category: "DESIGN",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/98/Dessau_Bauhaus_neu.JPG",
    imageAlt:
      "Fachada sur del edificio de la Bauhaus en Dessau, diseñado por Walter Gropius (1925-1926), Patrimonio de la Humanidad por la UNESCO",
    imageCredit: "Foto: Lelikron / Wikimedia Commons, CC BY-SA 3.0",
    styleSlug: "bauhaus",
    designerSlug: "marcel-breuer",
    sourceUrl: "https://en.wikipedia.org/wiki/Bauhaus",
    sourceName: "Wikipedia / The Metropolitan Museum of Art",
  },
  {
    slug: "japandi-fusion-estilos",
    title: "Japandi: el punto de encuentro entre el minimalismo japonés y la calidez escandinava",
    excerpt:
      "Ni puramente nórdico ni puramente japonés, el Japandi ha pasado de ser un neologismo de blogs de diseño a convertirse en una de las corrientes más citadas por revistas como Architectural Digest o Dezeen para describir los interiores contemporáneos.",
    body: "El término Japandi —contracción de \"Japan\" y \"Scandi\"— empezó a popularizarse hacia 2016 para describir un estilo que combina dos tradiciones de diseño con más puntos en común de lo que parece a primera vista: el wabi-sabi japonés, que encuentra belleza en la imperfección, la asimetría y el paso del tiempo sobre los materiales, y el hygge escandinavo, la búsqueda de calidez y bienestar en lo cotidiano. Aunque el nombre es reciente, la propia Wikipedia recuerda que los primeros ejemplos de esta fusión ya podían rastrearse mucho antes en la cerámica, la arquitectura y el mueble danés de posguerra, cuando diseñadores como Hans J. Wegner o Finn Juhl miraban abiertamente hacia Japón.\n\nEstéticamente, el Japandi se reconoce por una paleta de colores contenida —blancos rotos, beige, grises cálidos—, mobiliario de perfil bajo, materiales naturales como la madera, la piedra, el bambú o el papel, y una actitud general de \"menos pero mejor\": cada objeto tiene una función clara y se elimina todo lo superfluo. De la tradición japonesa toma elementos como los paneles correderos tipo shoji o el gusto por dejar el material a la vista; de la escandinava, la iluminación cálida e indirecta y la comodidad textil de mantas y alfombras de lana.\n\nRevistas de referencia como Architectural Digest lo han incluido entre los estilos más influyentes de los últimos años, y Dezeen le ha dedicado numerosos reportajes y selecciones de interiores, consolidándolo como una categoría propia dentro del vocabulario del diseño contemporáneo, más allá de la moda pasajera. Su auge también se explica por un cambio de fondo en la manera de habitar: tras años de espacios sobrecargados, cada vez más personas buscan interiores que funcionen como refugio, con menos objetos pero de mayor calidad y significado.\n\nEn el terreno del mobiliario, el Japandi favorece piezas de madera maciza con acabados naturales, líneas rectas sin ornamento y una construcción honesta que deja ver la unión de las piezas, un terreno en el que el mueble artesanal y el vintage escandinavo encuentran un lugar natural. No es casualidad que colaboraciones reales entre fabricantes japoneses y estudios nórdicos —como los proyectos de Norm Architects con la firma japonesa Karimoku— se citen hoy como ejemplos casi de manual de esta sensibilidad compartida.",
    category: "DESIGN",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/94/Wabi-Sabi_Apartment_by_MAKHNO_Studio.jpg",
    imageAlt:
      "Interior de líneas depuradas y materiales naturales del proyecto 'Wabi-Sabi Apartment' del estudio Makhno, ejemplo de la estética wabi-sabi que inspira el Japandi",
    imageCredit: "Foto: Serhii Kadulin / Makhno Studio, Wikimedia Commons, CC BY 2.0",
    styleSlug: "japandi",
    sourceUrl: "https://en.wikipedia.org/wiki/Japandi",
    sourceName: "Wikipedia / Dezeen",
  },
  {
    slug: "art-deco-resurgimiento",
    title: "El regreso del Art Déco: geometría, materiales nobles y el glamour de los años veinte reinterpretado",
    excerpt:
      "Cien años después de la Exposición de Artes Decorativas de París que dio nombre al movimiento, el Art Déco vive un resurgimiento en el interiorismo contemporáneo, con formas geométricas, latón, mármol y maderas exóticas como protagonistas.",
    body: "El Art Déco tomó su nombre de la Exposition Internationale des Arts Décoratifs et Industriels Modernes, celebrada en París en 1925, aunque su lenguaje —formas geométricas, simetría, materiales nobles y un lujo depurado y moderno— ya se venía gestando desde comienzos de la década de 1920. Un siglo después, ese vocabulario visual vive un momento de clara revalorización en el interiorismo internacional, hasta el punto de que medios especializados como Dezeen han dedicado series completas a repasar su centenario, y publicaciones como Elle Decor o Architectural Digest lo señalan como una de las referencias más recurrentes en proyectos residenciales de gama alta.\n\nLo distintivo del resurgimiento actual no es la réplica literal de interiores de los años veinte, sino la extracción de su esencia formal para aplicarla a espacios contemporáneos: arcos escalonados, motivos de abanico o rayos de sol, simetrías marcadas y un contraste deliberado entre superficies pulidas. El propio Dezeen ha reunido en sus últimas selecciones de interiores ejemplos de viviendas actuales que reinterpretan estos códigos combinándolos con tecnología y confort contemporáneos, en lugar de recrear escenografías de época.\n\nLos materiales siguen siendo la firma del estilo: mármol veteado, latón y metales dorados, maderas exóticas como el palisandro o la caoba, lacas y superficies de gran brillo. El edificio Chrysler de Nueva York (1930), con su vestíbulo de mármol rojo y ónix mexicano, sus puertas de ascensor con motivos de loto y su bóveda pintada, sigue siendo considerado uno de los ejemplos más completos y estudiados del estilo, y una referencia habitual para quienes hoy trabajan con este vocabulario.\n\nA diferencia de otros revivals, el Art Déco contemporáneo convive con una sensibilidad hacia la sostenibilidad: mobiliario vintage restaurado, chapados y textiles de época reincorporados a proyectos nuevos, en una lectura que combina el gusto por el glamour geométrico de los años veinte con las prioridades del diseño actual.",
    category: "DESIGN",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/62/Chrysler_Building_Lobby_2.jpg",
    imageAlt:
      "Vestíbulo Art Déco del edificio Chrysler en Nueva York, con mármol, motivos geométricos y acabados metálicos característicos del estilo",
    imageCredit: "Foto: Tony Hisgett / Wikimedia Commons, CC BY 2.0",
    styleSlug: "art-deco",
    sourceUrl: "https://www.dezeen.com/2025/04/29/a-to-z-art-deco-centenary/",
    sourceName: "Dezeen",
  },
  {
    slug: "knoll-modernismo-americano",
    title: "Knoll: el puente que trajo el modernismo europeo al mercado americano",
    excerpt:
      "Fundada en Nueva York en 1938 por Hans Knoll y transformada por la visión de Florence Knoll, la firma convirtió el lenguaje de la Bauhaus y del racionalismo europeo en el estándar del diseño de interiores americano de posguerra.",
    body: "Knoll nació en 1938 en Nueva York de la mano de Hans Knoll, hijo de una familia alemana de fabricantes de muebles —su padre, Walter Knoll, ya había producido en Stuttgart algunos de los primeros diseños de Mies van der Rohe—. Hans Knoll fundó la compañía con el propósito explícito de trasladar al mercado estadounidense los ideales modernos que había visto nacer en el entorno de la Bauhaus y del Werkbund alemán: formas funcionales, nuevos materiales industriales y una producción pensada para la escala, no para la pieza única.\n\nEl salto decisivo llegó en 1941, cuando se incorporó a la compañía Florence Schust, arquitecta formada en la Cranbrook Academy y discípula directa de Mies van der Rohe y Eliel Saarinen. Florence —que se casaría con Hans Knoll en 1946 y quedaría al frente de la empresa tras su muerte en 1955— aportó algo que iba mucho más allá del diseño de mobiliario individual: introdujo el concepto de planificación integral de espacios interiores, incluyendo textiles, disposición y arquitectura de interiores corporativos, redefiniendo así el propio negocio del diseño de oficinas en Estados Unidos.\n\nBajo la dirección de los Knoll, la compañía obtuvo los derechos de fabricación para Norteamérica de piezas que hoy son iconos absolutos del siglo XX: la silla Barcelona de Mies van der Rohe y Lilly Reich, cedida formalmente a Knoll en 1953, la Womb Chair y la serie Tulip de Eero Saarinen, o las estructuras de alambre de Harry Bertoia. De este modo, Knoll operó como auténtico puente transatlántico: convirtió el racionalismo europeo de entreguerras —muchas veces gestado en los talleres de la Bauhaus— en el mobiliario que equiparía despachos, universidades e instituciones americanas durante décadas, y sentó las bases de lo que hoy reconocemos como el canon del diseño moderno de mediados de siglo.\n\nMás de cuarenta piezas producidas por Knoll forman parte de la colección permanente del Museum of Modern Art de Nueva York, un testimonio del papel de la firma no solo como fabricante, sino como institución que ayudó a definir el gusto moderno americano.",
    category: "MANUFACTURER",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6a/Barcelona_chair%2C_Guggenheim_Bilbao.jpg",
    imageAlt:
      "Silla Barcelona de Ludwig Mies van der Rohe y Lilly Reich, fabricada por Knoll, expuesta en una muestra sobre diseño de los años veinte en el Museo Guggenheim Bilbao",
    imageCredit: "Foto: Luistxo / Wikimedia Commons, CC BY-SA 4.0",
    manufacturerSlug: "knoll",
    sourceUrl: "https://en.wikipedia.org/wiki/Knoll_(company)",
    sourceName: "Wikipedia",
  },
  {
    slug: "vitra-licencias-y-diseno-contemporaneo",
    title: "Vitra: de fabricante bajo licencia a laboratorio de diseño contemporáneo",
    excerpt:
      "Fundada en Suiza en 1950, Vitra empezó fabricando bajo licencia los diseños de Eames y George Nelson para el mercado europeo y terminó convirtiéndose, con el Vitra Design Museum y el Vitra Campus, en una de las instituciones más influyentes del diseño actual.",
    body: "Vitra fue fundada en 1950 por el matrimonio suizo Willi y Erika Fehlbaum, inicialmente como una empresa de mobiliario para tiendas con sede cerca de Basilea. El giro decisivo llegó en 1953, cuando los Fehlbaum viajaron a Nueva York y descubrieron el trabajo de Charles y Ray Eames y de George Nelson. Aquel encuentro derivó en un acuerdo con Herman Miller que permitió a Vitra empezar a fabricar y distribuir esos diseños para el mercado europeo a partir de 1957, convirtiendo a la firma suiza en la puerta de entrada del modernismo americano de posguerra en Europa.\n\nEsa relación de licencia se prolongó durante más de tres décadas, hasta que en 1984 Vitra puso fin al acuerdo con Herman Miller y adquirió los derechos propios e independientes para producir y comercializar en Europa y Oriente Medio las piezas de Eames y Nelson, además de incorporar progresivamente al catálogo obra de otros grandes nombres del diseño moderno, como Jean Prouvé —cuya Home Collection lanzó en 2004— o Verner Panton, autor de la Panton Chair de 1967, la primera silla cantilever fabricada íntegramente en plástico moldeado.\n\nEl paso de fabricante con licencia a institución de referencia del diseño se consolidó con la creación, en 1989, del Vitra Design Museum por iniciativa de Rolf Fehlbaum, hijo de los fundadores. El edificio, obra de Frank Gehry, fue el primer proyecto europeo del arquitecto y marcó el inicio del Vitra Campus en Weil am Rhein, que con los años sumaría arquitectura de Zaha Hadid, Tadao Ando, Álvaro Siza o Herzog & de Meuron, convirtiendo la sede fabril de la compañía en un recorrido construido por la arquitectura contemporánea internacional.\n\nHoy Vitra combina la reedición fiel de clásicos del siglo XX con el desarrollo de nuevas colecciones firmadas por diseñadores contemporáneos, y el propio Vitra Design Museum funciona como institución cultural independiente dedicada a la investigación y difusión del diseño industrial, lo que ha terminado por definir a la compañía tanto por su catálogo de mobiliario como por su papel activo en la conversación sobre arquitectura y diseño contemporáneos.",
    category: "MANUFACTURER",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/35/Vitra_Design_Museum_by_Frank_Gehry.jpg",
    imageAlt:
      "Edificio del Vitra Design Museum en Weil am Rhein (Alemania), diseñado por Frank Gehry, primer proyecto europeo del arquitecto",
    imageCredit: "Foto: Kotivalo / Wikimedia Commons, CC BY-SA 3.0",
    manufacturerSlug: "vitra",
    sourceUrl: "https://en.wikipedia.org/wiki/Vitra_(furniture)",
    sourceName: "Wikipedia",
  },
  {
    slug: "fritz-hansen-150-anos",
    title: "Fritz Hansen: más de 150 años dando forma al diseño danés",
    excerpt:
      "De la carpintería fundada en 1872 en Copenhague a sinónimo mundial del diseño escandinavo: la historia de Fritz Hansen es, en gran medida, la historia de sus colaboraciones con Arne Jacobsen y Hans J. Wegner.",
    body: "Fritz Hansen abrió su taller de carpintería en Copenhague en 1872. Durante sus primeras décadas fue una firma respetada pero convencional dentro del panorama del mueble danés, dedicada sobre todo a mobiliario en madera curvada al vapor, técnica con la que presentó su primera silla en 1915. Nada en ese arranque anunciaba todavía que la compañía acabaría convirtiéndose en una de las referencias mundiales del diseño del siglo XX.\n\nEl punto de inflexión llegó en 1934, cuando Fritz Hansen inició su colaboración con el arquitecto Arne Jacobsen, a raíz del proyecto residencial de Bellevue y Bellavista en Klampenborg. De esa alianza nacieron algunas de las piezas más reproducidas y estudiadas de la historia del mobiliario: la Hormiga (1952), la Serie 7 (1955) —la silla más vendida y más copiada del mundo—, la Grand Prix (1957) y, para el vestíbulo del Hotel SAS Royal de Copenhague, el Cisne y el Huevo, ambos de 1958. Durante los años cuarenta la firma trabajó también con Hans J. Wegner, cuya silla China de 1944 se cuenta entre las piezas más depuradas producidas por la compañía en la primera mitad del siglo.\n\nLa Segunda Guerra Mundial aportó, de forma indirecta, una de las innovaciones técnicas que definirían el futuro de Fritz Hansen: la técnica de laminado desarrollada para la construcción de los aviones Mosquito británicos. La empresa comprendió el potencial de este procedimiento —capas finas de chapa de madera encoladas y prensadas— para el mobiliario, y lo convirtió en la base constructiva de sus diseños más icónicos, permitiendo formas curvas, ligeras y resistentes que antes eran imposibles de fabricar en madera maciza.\n\nEn 1982 Fritz Hansen adquirió los derechos de gran parte del catálogo de Poul Kjærholm, ampliando su legado más allá de Jacobsen, y desde los años ochenta ha seguido sumando colaboraciones con diseñadores contemporáneos como Cecilie Manz o Kasper Salto, sin abandonar nunca los principios de funcionalidad y honestidad material que definieron a la marca desde sus orígenes. Hoy, con sede en Allerød y presencia internacional bajo el nombre Republic of Fritz Hansen, la compañía sigue fabricando muchas de esas mismas piezas de los años cincuenta, convertidas ya en clásicos incuestionables del diseño moderno.",
    category: "MANUFACTURER",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/50/Republic_of_Fritz_Hansen_showroom%2C_2017.jpg",
    imageAlt: "Showroom de Republic of Fritz Hansen con las sillas Cisne y Huevo de Arne Jacobsen expuestas",
    imageCredit: "Foto: Holger.Ellgaard / Wikimedia Commons, CC BY-SA 4.0",
    styleSlug: "mid-century-modern",
    designerSlug: "arne-jacobsen",
    manufacturerSlug: "fritz-hansen",
    sourceUrl: "https://en.wikipedia.org/wiki/Fritz_Hansen_(company)",
    sourceName: "Wikipedia",
  },
  {
    slug: "nogal-macizo-material-de-lujo",
    title: "Nogal macizo: la madera que define el mueble de alta gama",
    excerpt:
      "Pocas maderas han acompañado tanto tiempo a la ebanistería de lujo como el nogal, apreciado desde el siglo XVII por su veteado, su densidad de trabajo ideal y su capacidad de envejecer con carácter.",
    body: "Durante buena parte de los siglos XVII y XVIII, el nogal fue la madera más codiciada de la ebanistería europea. En Inglaterra, el periodo que va del reinado de la reina Ana hasta los primeros años georgianos se conoce entre anticuarios como la \"edad del nogal\", una etapa en la que esta madera desplazó al roble como material preferente para el mobiliario de calidad, gracias a una combinación de color cálido —que va del dorado pálido al marrón chocolate— y una variación de veteado que ninguna otra especie ofrecía con la misma riqueza.\n\nLo que hizo del nogal un material de lujo no fue solo su aspecto, sino también su comportamiento en el taller. Su densidad es lo bastante alta como para resistir golpes y el desgaste del uso diario, pero no tanto como para volverse quebradizo, lo que permitía a los ebanistas tallar, tornear y ensamblar con precisión piezas destinadas a durar generaciones. Los cortes más apreciados —el nogal \"burr\" o con figuras en remolino, procedente de las raíces y las horquillas de las ramas— se reservaban como chapa fina para decorar superficies con patrones de \"cuarteado\" o de \"ostras\", mientras que el nogal macizo se empleaba en la estructura y en las piezas donde el grosor y la solidez importaban tanto como la estética.\n\nEl propio mercado del nogal vivió un episodio que ilustra su valor histórico: el crudo invierno de 1709 diezmó buena parte de los nogales franceses, y hacia 1720 Francia prohibió la exportación de la madera, cuando apenas una década antes había suministrado la inmensa mayoría del nogal que llegaba a Inglaterra. La crisis reorientó el comercio hacia las colonias americanas, cuyo nogal negro, favorecido por la reducción de aranceles de la Ley de Suministros Navales de 1721, se convirtió en la nueva fuente de referencia para los talleres británicos.\n\nAunque la caoba acabaría desplazando al nogal como madera dominante hacia mediados del siglo XVIII, el nogal nunca perdió su estatus de elección tradicional para el mobiliario distinguido, y experimentó un renacimiento notable en la ebanistería chapada de los años veinte. Ese prestigio continuo explica por qué, un siglo después, el nogal macizo sigue siendo hoy sinónimo de mobiliario de gama alta: une un veteado inconfundible con una nobleza de trabajo que muy pocas maderas igualan.",
    category: "MATERIAL",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Oberfl%C3%A4che_Wohnzimmertisch.JPG",
    imageAlt: "Superficie de una mesa de salón de nogal europeo macizo mostrando su veteado natural",
    imageCredit: "Foto: Martin Lorenz (Rosenmulde) / Wikimedia Commons, CC BY-SA 3.0",
    woodTypeSlug: "nogal",
    sourceUrl: "https://antique-collecting.co.uk/2019/06/14/a-guide-to-18th-century-antique-walnut-furniture/",
    sourceName: "Antique Collecting",
  },
  {
    slug: "roble-material-atemporal",
    title: "Roble: la madera que nunca pasa de moda",
    excerpt:
      "Del arcón medieval al Wishbone Chair de Hans Wegner, el roble ha acompañado siglos de mobiliario europeo gracias a una dureza y un carácter que el tiempo, lejos de desgastar, embellece.",
    body: "El roble ha sido durante siglos una de las maderas estructurales por excelencia del mobiliario europeo, desde los arcones y aparadores del periodo medieval y jacobino hasta el diseño escandinavo del siglo XX. Su elevado contenido en ácido tánico le confiere una dureza excepcional, lo que la convierte en una madera especialmente resistente al desgaste cotidiano, mientras que su veta marcada y su carácter vivo la hacen fácilmente reconocible incluso después de un tratamiento superficial.\n\nEn el diseño danés de posguerra, el roble se consolidó como material de referencia. Hans J. Wegner, formado como ebanista antes de convertirse en uno de los diseñadores más influyentes del llamado Danish Modern, recurría al roble incluso en las partes internas de piezas chapadas, para reforzar la sensación de solidez de la pieza terminada. Esa filosofía —privilegiar la honestidad del material sobre el atajo decorativo— es la misma que sigue guiando hoy a fabricantes como Carl Hansen & Søn, que emplea exclusivamente el duramen del roble, la parte más densa y estable del árbol, seleccionado tabla a tabla y certificado por gestión forestal responsable.\n\nParte de la atemporalidad del roble reside en cómo envejece: sin tratar, desarrolla con los años un tono cálido, entre amarillo y marrón, que añade carácter en lugar de restarlo. A diferencia de la chapa, la madera maciza de roble puede lijarse, repararse y devolver a su aspecto original una y otra vez a lo largo de décadas, lo que explica tanto su presencia constante en el mobiliario de mayor calidad como su atractivo actual para quienes valoran la durabilidad frente al mueble desechable.\n\nEsa combinación de resistencia física, belleza discreta y capacidad de restauración es, en definitiva, lo que ha mantenido al roble en el centro del oficio del mueble durante generaciones distintas y estéticas muy diferentes entre sí, del Jacobino al escandinavo contemporáneo.",
    category: "MATERIAL",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/57/Eiche_%28Holz%29.JPG",
    imageAlt: "Primer plano de madera de roble claro mostrando su veteado característico",
    imageCredit: "Foto: Fabian R / Wikimedia Commons, CC BY-SA 3.0",
    woodTypeSlug: "roble",
    styleSlug: "escandinavo",
    designerSlug: "hans-j-wegner",
    manufacturerSlug: "carl-hansen-son",
    sourceUrl: "https://www.carlhansen.com/en/en/materials/wood/oak",
    sourceName: "Carl Hansen & Søn",
  },
  {
    slug: "mercado-mobiliario-vintage",
    title: "El auge sostenido del mercado del mobiliario vintage",
    excerpt:
      "Coleccionistas, casas de subastas y una conciencia creciente sobre la economía circular están consolidando el mueble de diseño de segunda mano como una categoría propia, lejos ya del simple mercado de ocasión.",
    body: "Durante los últimos años, el mobiliario de diseño de segunda mano ha dejado de ser un nicho para anticuarios y coleccionistas especializados y se ha ido consolidando como un segmento propio dentro del mercado del mueble, con un crecimiento sostenido tanto en volumen de operaciones como en el número de compradores que participan en él. Casas de subastas históricamente centradas en arte y objetos de alto valor han institucionalizado esta categoría: Sotheby's, por ejemplo, mantiene un departamento permanente dedicado al diseño del siglo XX y a la venta de interiores de estilo mid-century, una señal clara de que el mobiliario de autor con procedencia y firma reconocida se ha convertido en un activo coleccionable por derecho propio.\n\nEsa institucionalización convive con una transformación más amplia del propio concepto de \"segunda mano\". Ya no se trata únicamente de piezas rescatadas por su antigüedad, sino de un mercado que valora explícitamente la autenticidad, la procedencia y la calidad de fabricación frente a la producción masiva contemporánea. Las propias casas de subastas han empezado a organizar eventos pensados específicamente para atraer a una nueva generación de compradores —los llamados encuentros \"Next-Gen Collector\"—, conscientes de que el perfil del comprador de diseño vintage se ha rejuvenecido notablemente en los últimos años.\n\nLa sostenibilidad es, junto con el valor de colección, el otro gran motor de este crecimiento. Comprar una pieza de diseño ya existente, en lugar de una nueva, se percibe cada vez más como un gesto alineado con los principios de la economía circular: objetos bien construidos que ganan valor y significado con el tiempo en lugar de terminar descartados. Esta lectura ha impulsado tanto a plataformas especializadas en diseño vintage como a iniciativas de recompra y reventa lanzadas por fabricantes y grandes distribuidores de mobiliario, que han encontrado en el mueble usado de calidad un modelo de negocio en expansión.\n\nEl resultado es un mercado dual: por un lado, el circuito coleccionista de piezas firmadas y numeradas que sigue de cerca las subastas de diseño; por otro, un público más amplio que redescubre el mueble vintage como alternativa consciente al mobiliario de usar y tirar. Ambos circuitos, aunque distintos en escala y objetivo, apuntan en la misma dirección: el mueble con historia vuelve a tener un lugar central en cómo decoramos nuestras casas.",
    category: "MARKET",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/c6/Inside_Tewkesbury_Antiques_Centre%2C_Tolsey_Lane_-_geograph.org.uk_-_6706089.jpg",
    imageAlt: "Interior de un centro de antigüedades con mobiliario vintage expuesto para la venta",
    imageCredit: "Foto: Jeff Gogarty / Wikimedia Commons (Geograph Britain and Ireland), CC BY-SA 2.0",
    styleSlug: "mid-century-modern",
    sourceUrl: "https://ronati.com/the-antiques-market-in-2025-a-new-era-of-growth-and-opportunity/",
    sourceName: "Ronati",
  },
  {
    slug: "mercado-antiguedades-nueva-generacion",
    title: "Una nueva generación redescubre las antigüedades",
    excerpt:
      "Millennials y generación Z están cambiando el perfil del comprador de antigüedades: menos interesados en la pieza por su edad y más en su historia, su sostenibilidad y su capacidad de definir un estilo propio.",
    body: "El comprador típico de antigüedades ya no responde al retrato tradicional. En los últimos años, compradores millennials y de la generación Z se han incorporado de forma notable al mercado de antigüedades y objetos vintage, con un comportamiento que rompe con la lógica de la herencia familiar: en lugar de recibir piezas por transmisión generacional, las buscan activamente en tiendas de segunda mano, mercadillos, centros de antigüedades y plataformas online especializadas como Etsy o Chairish.\n\nEste nuevo público no compra antigüedades porque sean antiguas, sino porque encajan con una estética, un estilo de vida o una identidad personal. Por eso muestra predilección selectiva: el mobiliario de gran formato de estilo victoriano genera menos interés, mientras que las piezas de diseño de mediados de siglo, la iluminación retro, el cristal artístico y los textiles vintage se han convertido en objetos de deseo. Las redes sociales —especialmente Instagram y TikTok— desempeñan un papel decisivo en este redescubrimiento, con creadores que documentan hallazgos de \"thrifting\" y proyectos de restauración casera que despiertan el interés de sus seguidores por el mercado de segunda mano.\n\nLa sostenibilidad es una motivación explícita y recurrente entre estos compradores. Adquirir una pieza ya existente se entiende como una forma de alejarse del mueble desechable y de alinear las decisiones de compra con valores medioambientales; según un estudio de la plataforma de reventa Chairish, una parte significativa de los compradores millennial considera que el mercado de segunda mano desempeña un papel importante en el futuro de la sostenibilidad del sector del hogar. A esto se suma, para algunos compradores, una lectura financiera: ciertas piezas vintage se perciben también como un activo capaz de revalorizarse con el tiempo, no solo como un objeto decorativo.\n\nLas propias casas de subastas y comercios especializados han empezado a adaptarse a este cambio generacional, ampliando su presencia digital y organizando actividades pensadas para atraer a compradores más jóvenes. El resultado es un mercado de antigüedades que, sin renunciar a su público tradicional, se abre a una nueva sensibilidad: menos protocolaria, más visual, y profundamente marcada por la búsqueda de autenticidad frente a la producción en serie.",
    category: "MARKET",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/2/2c/Vintage_kitchen_baking_cabinet_and_storage_unit_-_DSC02663.jpg",
    imageAlt: "Mueble antiguo de cocina de principios del siglo XX, alacena de madera con cajones y puertas para almacenaje",
    imageCredit: "Foto: Pjrsoap / Wikimedia Commons, CC BY-SA 4.0",
    sourceUrl:
      "https://www.antiquetrader.com/antiques-news/not-your-grandparents-heirlooms-why-younger-generations-are-embracing-family-keepsakes-on-their-own-terms",
    sourceName: "Antique Trader",
  },
  {
    slug: "restauracion-de-mobiliario-de-autor",
    title: "El oficio de restaurar: por qué conservar vale más que sustituir",
    excerpt:
      "Restaurar una pieza de autor o una antigüedad exige un dominio de ebanistería, tapicería y acabados que pocas veces se aprecia a simple vista, pero del que depende buena parte del valor final del mueble.",
    body: "Restaurar mobiliario de autor o piezas antiguas es un oficio que combina disciplinas muy distintas: ebanistería y ensamblaje, tapicería, torneado, rejillado y acabado de superficies. Un buen restaurador necesita entender no solo cómo reparar una junta o sustituir un elemento dañado, sino también reconocer el tipo de madera, la técnica constructiva original y los materiales —colas, barnices, tejidos— que se emplearon en su día, para poder intervenir sin traicionar la naturaleza de la pieza.\n\nUna de las distinciones más importantes del oficio es la que separa restaurar de renovar. Renovar implica eliminar por completo el acabado original y aplicar uno nuevo; restaurar, en cambio, consiste en limpiar, revivir y proteger el acabado existente siempre que sea posible. Esta diferencia no es solo técnica: en mobiliario antiguo o de diseño con valor de colección, conservar el acabado y los elementos originales protege la historia y el valor de la pieza, mientras que una renovación agresiva puede borrar precisamente lo que la hace valiosa.\n\nEsa misma lógica explica por qué, entre restauradores profesionales, existe una norma de contención bastante extendida: se considera aceptable intervenir hasta aproximadamente un 30% de una pieza antigua, pero superar ese umbral puede reducir de forma significativa su valor. Por eso se prefieren materiales reversibles —la cola de hueso tradicional frente a adhesivos sintéticos modernos, por ejemplo—, que permiten a un restaurador futuro deshacer una reparación anterior sin dañar la pieza, un principio central de la conservación bien entendida.\n\nEn el caso del mobiliario de autor y de diseño, estos criterios cobran una relevancia añadida: la ebanistería original, la tapicería de época o el ensamblaje concebido por el propio diseñador forman parte de la autenticidad y, por tanto, del valor de mercado de la pieza. Sustituir sin necesidad un elemento original por uno nuevo, aunque sea más cómodo o económico a corto plazo, suele significar perder parte de lo que convierte a esa silla o a ese aparador en algo distinto de una simple reproducción.",
    category: "DESIGN",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d0/FurnitureConservation2.jpg",
    imageAlt:
      "Reencolado de un elemento suelto en un arcón de madera maciza de nogal del siglo XIX durante un proceso de restauración",
    imageCredit: "Foto: Etan J. Tal / Wikimedia Commons, CC BY 3.0",
    sourceUrl: "https://en.wikipedia.org/wiki/Furniture_repair",
    sourceName: "Wikipedia",
  },
  {
    slug: "wassily-chair-marcel-breuer",
    title: "La Silla Wassily: el tubo de acero que redefinió el asiento moderno",
    excerpt:
      "Diseñada por Marcel Breuer en el taller de la Bauhaus en Dessau (1925-1926), la Wassily fue la primera silla en usar tubo de acero doblado como estructura. Casi cien años después, sigue en el catálogo de Knoll.",
    body: "Marcel Breuer diseñó la Wassily entre 1925 y 1926 mientras dirigía el taller de ebanistería de la Bauhaus en Dessau, poco después de que la escuela se trasladara allí desde Weimar. La pieza, catalogada originalmente como modelo B3, fue la primera silla de la historia en construirse enteramente sobre una estructura de tubo de acero doblado en frío — un material industrial, hasta entonces ajeno al mobiliario doméstico, que Breuer adoptó por su ligereza y su posibilidad de producción en serie. En su versión original, el asiento, el respaldo y los reposabrazos no eran de cuero sino de Eisengarn, un hilo de algodón encerado, resistente y brillante, típico de la tapicería centroeuropea de la época; las correas de cuero llegarían después, en reediciones posteriores.\n\nEl nombre «Wassily» no formó parte del diseño original ni fue un homenaje explícito. La silla no se concibió pensando en el pintor Wassily Kandinsky, colega de Breuer en la Bauhaus, aunque este admiró el diseño terminado y Breuer le fabricó una copia para su vivienda. La asociación entre el nombre y la pieza se consolidó décadas más tarde, cuando el fabricante italiano Gavina la reeditó y descubrió, al investigar el origen del diseño, la anécdota de Kandinsky — el nombre quedó fijado desde entonces en el uso popular.\n\nLa silla se fabricó primero, a finales de los años veinte, por Thonet, el fabricante germano-austríaco célebre por su mueble de madera curvada. Tras pasar por distintas manos a lo largo del siglo XX, fue Knoll quien terminó por controlar los derechos del diseño en 1968, al adquirir el Gavina Group de Bolonia, incorporando así toda la obra de Breuer a su catálogo. Hoy Knoll sigue fabricando la Wassily con el mismo armazón de tubo de acero cromado, ahora habitualmente tapizado en correas de cuero.",
    category: "ICONIC_PIECE",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/0d/Wassily_Chair_by_Marcel_Breuer%2C_reproduction%2C_1925%2C_chrome_covered_steel_and_belting_leather_-_University_of_Arizona_Museum_of_Art_-_University_of_Arizona_-_Tucson%2C_AZ_-_DSC08029.jpg",
    imageAlt:
      "Silla Wassily de Marcel Breuer, con estructura de acero tubular cromado y correas de cuero rojo, expuesta en el University of Arizona Museum of Art",
    imageCredit: "Foto: Daderot / Wikimedia Commons, dominio público (CC0)",
    styleSlug: "bauhaus",
    designerSlug: "marcel-breuer",
    manufacturerSlug: "knoll",
    sourceUrl: "https://en.wikipedia.org/wiki/Wassily_Chair",
    sourceName: "Wikipedia",
  },
];

// Contraseña compartida por todas las cuentas demo — solo para este
// entorno de desarrollo/seed, nunca para producción.
const DEMO_PASSWORD = "Nogal1234!";

interface DemoUserSeed {
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  bio: string | null;
  city: string;
  countryIso: string;
  role: RoleName;
}

const demoUsers: DemoUserSeed[] = [
  {
    email: "admin@nogal.cl",
    firstName: "Administración",
    lastName: "Nogal",
    username: "nogal_admin",
    bio: "Cuenta de administración de la plataforma.",
    city: "Santiago",
    countryIso: "CL",
    role: "ADMIN",
  },
  {
    email: "maria.soto@nogal.cl",
    firstName: "María Elena",
    lastName: "Soto",
    username: "maria_soto",
    bio: "Curadora de diseño de mediados de siglo. 12 años restaurando piezas de autor en Santiago.",
    city: "Santiago",
    countryIso: "CL",
    role: "USER",
  },
  {
    email: "tomas.bravo@nogal.cl",
    firstName: "Tomás",
    lastName: "Bravo",
    username: "tomas_bravo",
    bio: "Anticuario de tercera generación. Especialista en piezas industriales y Art Déco.",
    city: "Valparaíso",
    countryIso: "CL",
    role: "USER",
  },
  {
    email: "javiera.munoz@example.com",
    firstName: "Javiera",
    lastName: "Muñoz",
    username: "javiera_m",
    bio: "Coleccionista amateur, buscando piezas para renovar el living.",
    city: "Santiago",
    countryIso: "CL",
    role: "USER",
  },
  {
    email: "ignacio.rojas@example.com",
    firstName: "Ignacio",
    lastName: "Rojas",
    username: "ignacio_r",
    bio: null,
    city: "Providencia",
    countryIso: "CL",
    role: "USER",
  },
];

interface DemoStoreSeed {
  ownerEmail: string;
  name: string;
  bio: string;
  city: string;
  region: string;
  countryIso: string;
  websiteUrl: string;
  socialLinks: Record<string, string>;
  schedule: Record<string, string>;
}

const demoStores: DemoStoreSeed[] = [
  {
    ownerEmail: "maria.soto@nogal.cl",
    name: "Atelier Casa Nogal",
    bio: "Piezas de autor escandinavas y de mediados de siglo, restauradas a mano en nuestro taller de Providencia.",
    city: "Santiago",
    region: "Región Metropolitana",
    countryIso: "CL",
    websiteUrl: "https://ateliercasanogal.example.com",
    socialLinks: {
      instagram: "https://instagram.com/ateliercasanogal",
      facebook: "https://facebook.com/ateliercasanogal",
    },
    schedule: {
      lun_vie: "10:00–19:00",
      sabado: "11:00–15:00",
      domingo: "Cerrado",
    },
  },
  {
    ownerEmail: "tomas.bravo@nogal.cl",
    name: "Bravo Diseño & Antigüedades",
    bio: "Anticuario familiar en el Cerro Concepción. Piezas industriales, Art Déco y objetos con procedencia documentada.",
    city: "Valparaíso",
    region: "Valparaíso",
    countryIso: "CL",
    websiteUrl: "https://bravoantiguedades.example.com",
    socialLinks: {
      instagram: "https://instagram.com/bravoantiguedades",
    },
    schedule: {
      mar_sab: "11:00–18:30",
      lun_dom: "Cerrado",
    },
  },
];

interface DemoFurnitureSeed {
  storeName: string;
  title: string;
  description: string;
  categorySlug: string;
  materialSlugs: string[];
  woodTypeSlugs: string[];
  styleSlug: string;
  designerSlug: string | null;
  manufacturerSlug: string | null;
  originCountryIso: string | null;
  locationCity: string;
  condition: FurnitureCondition;
  originality: Originality;
  decade: number;
  priceClp: number;
  imageSeed: string;
  imageCount: number;
}

const demoFurniture: DemoFurnitureSeed[] = [
  {
    storeName: "Atelier Casa Nogal",
    title: "Silla Wegner en roble",
    description:
      "Silla de líneas orgánicas en roble macizo, tapizada en cuero natural. Pieza original de los años 60, con certificado de procedencia del taller original.",
    categorySlug: "sillas",
    materialSlugs: ["madera-maciza", "cuero"],
    woodTypeSlugs: ["roble"],
    styleSlug: "escandinavo",
    designerSlug: "hans-j-wegner",
    manufacturerSlug: "carl-hansen-s-n",
    originCountryIso: "DK",
    locationCity: "Santiago",
    condition: "EXCELLENT",
    originality: "ORIGINAL",
    decade: 1960,
    priceClp: 890_000,
    imageSeed: "nogal-silla-wegner",
    imageCount: 4,
  },
  {
    storeName: "Atelier Casa Nogal",
    title: "Mesa de centro en nogal",
    description:
      "Mesa de centro escandinava en madera de nogal maciza, con patas cónicas torneadas a mano. Restaurada íntegramente con aceites naturales.",
    categorySlug: "mesas",
    materialSlugs: ["madera-maciza"],
    woodTypeSlugs: ["nogal"],
    styleSlug: "mid-century-modern",
    designerSlug: null,
    manufacturerSlug: null,
    originCountryIso: "SE",
    locationCity: "Santiago",
    condition: "VERY_GOOD",
    originality: "ORIGINAL",
    decade: 1950,
    priceClp: 650_000,
    imageSeed: "nogal-mesa-centro",
    imageCount: 4,
  },
  {
    storeName: "Bravo Diseño & Antigüedades",
    title: "Cómoda Art Déco en cedro",
    description:
      "Cómoda de cinco cajones en madera de cedro con tiradores originales en latón. Marquetería geométrica característica del período Art Déco.",
    categorySlug: "comodas",
    materialSlugs: ["madera-maciza", "laton"],
    woodTypeSlugs: ["cedro"],
    styleSlug: "art-deco",
    designerSlug: null,
    manufacturerSlug: null,
    originCountryIso: "FR",
    locationCity: "Valparaíso",
    condition: "GOOD",
    originality: "ORIGINAL",
    decade: 1930,
    priceClp: 980_000,
    imageSeed: "nogal-comoda-art-deco",
    imageCount: 4,
  },
  {
    storeName: "Bravo Diseño & Antigüedades",
    title: "Buffet industrial en pino",
    description:
      "Buffet de estilo industrial en madera de pino y estructura de acero. Ideal para comedor o living, con espacio interior amplio y puertas correderas.",
    categorySlug: "buffets",
    materialSlugs: ["madera-maciza", "acero"],
    woodTypeSlugs: ["pino"],
    styleSlug: "industrial",
    designerSlug: null,
    manufacturerSlug: null,
    originCountryIso: "CL",
    locationCity: "Valparaíso",
    condition: "VERY_GOOD",
    originality: "ORIGINAL",
    decade: 1970,
    priceClp: 540_000,
    imageSeed: "nogal-buffet-industrial",
    imageCount: 4,
  },
  {
    storeName: "Atelier Casa Nogal",
    title: "Velador Bauhaus en fresno",
    description:
      "Velador de líneas puras en madera de fresno con sobre de vidrio templado. Diseño funcionalista inspirado en la escuela Bauhaus.",
    categorySlug: "veladores",
    materialSlugs: ["madera-maciza", "vidrio"],
    woodTypeSlugs: ["fresno"],
    styleSlug: "bauhaus",
    designerSlug: null,
    manufacturerSlug: null,
    originCountryIso: "DE",
    locationCity: "Santiago",
    condition: "EXCELLENT",
    originality: "ORIGINAL",
    decade: 1930,
    priceClp: 210_000,
    imageSeed: "nogal-velador-bauhaus",
    imageCount: 3,
  },
  {
    storeName: "Atelier Casa Nogal",
    title: "Sofá Chesterfield en cuero",
    description:
      "Sofá Chesterfield de tres cuerpos en cuero envejecido, con capitoné manual y patas en madera torneada. Restauración completa de tapicería.",
    categorySlug: "sofas",
    materialSlugs: ["cuero", "madera-maciza"],
    woodTypeSlugs: ["caoba"],
    styleSlug: "victoriano",
    designerSlug: null,
    manufacturerSlug: null,
    originCountryIso: "GB",
    locationCity: "Santiago",
    condition: "RESTORED",
    originality: "ORIGINAL",
    decade: 1920,
    priceClp: 1_450_000,
    imageSeed: "nogal-sofa-chesterfield",
    imageCount: 4,
  },
  {
    storeName: "Atelier Casa Nogal",
    title: "Escritorio Ponti en teca",
    description:
      "Escritorio de líneas depuradas en madera de teca maciza, con cajonera lateral suspendida. Pieza de autor con procedencia documentada.",
    categorySlug: "escritorios",
    materialSlugs: ["madera-maciza"],
    woodTypeSlugs: ["teca"],
    styleSlug: "mid-century-modern",
    designerSlug: "gio-ponti",
    manufacturerSlug: "cassina",
    originCountryIso: "IT",
    locationCity: "Providencia",
    condition: "EXCELLENT",
    originality: "ORIGINAL",
    decade: 1950,
    priceClp: 3_200_000,
    imageSeed: "nogal-escritorio-ponti",
    imageCount: 4,
  },
  {
    storeName: "Bravo Diseño & Antigüedades",
    title: "Librero modular escandinavo",
    description:
      "Sistema de librero modular en madera de haya, componible en distintas configuraciones. Estructura ligera de líneas escandinavas.",
    categorySlug: "libreros",
    materialSlugs: ["madera-maciza"],
    woodTypeSlugs: ["haya"],
    styleSlug: "escandinavo",
    designerSlug: null,
    manufacturerSlug: null,
    originCountryIso: "SE",
    locationCity: "Valparaíso",
    condition: "GOOD",
    originality: "ORIGINAL",
    decade: 1960,
    priceClp: 480_000,
    imageSeed: "nogal-librero-escandinavo",
    imageCount: 3,
  },
  {
    storeName: "Atelier Casa Nogal",
    title: "Lámpara de piso Art Déco en latón",
    description:
      "Lámpara de piso en latón macizo con pantalla de cristal esmerilado original. Pieza decorativa de gran presencia, totalmente funcional.",
    categorySlug: "iluminacion",
    materialSlugs: ["laton", "cristal"],
    woodTypeSlugs: [],
    styleSlug: "art-deco",
    designerSlug: null,
    manufacturerSlug: null,
    originCountryIso: "FR",
    locationCity: "Santiago",
    condition: "VERY_GOOD",
    originality: "ORIGINAL",
    decade: 1930,
    priceClp: 320_000,
    imageSeed: "nogal-lampara-art-deco",
    imageCount: 3,
  },
  {
    storeName: "Bravo Diseño & Antigüedades",
    title: "Alfombra persa antigua",
    description:
      "Alfombra persa anudada a mano, motivos florales tradicionales. Pieza de colección que requiere restauración menor en los bordes.",
    categorySlug: "textiles-y-alfombras",
    materialSlugs: [],
    woodTypeSlugs: [],
    styleSlug: "rustico",
    designerSlug: null,
    manufacturerSlug: null,
    originCountryIso: null,
    locationCity: "Viña del Mar",
    condition: "FOR_RESTORATION",
    originality: "ORIGINAL",
    decade: 1900,
    priceClp: 890_000,
    imageSeed: "nogal-alfombra-persa",
    imageCount: 3,
  },
];

function slugify(value: string): string {
  return value
    // Letras nórdicas que NFD no descompone en base + diacrítico (ø, æ, å
    // son letras propias, no "o"/"a" con tilde) — sin este mapeo previo
    // quedan fuera del alfabeto y se pierden como guiones.
    .replace(/[øØ]/g, "o")
    .replace(/[æÆ]/g, "ae")
    .replace(/[åÅ]/g, "a")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function picsumUrl(seed: string, index: number): string {
  return `https://picsum.photos/seed/${seed}-${index}/1200/1500`;
}

async function seedRoles() {
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description, permissions: role.permissions },
      create: role,
    });
  }
}

async function seedCountries() {
  for (const country of countries) {
    const slug = slugify(country.name);
    await prisma.country.upsert({
      where: { isoCode: country.isoCode },
      update: { name: country.name, slug },
      create: { ...country, slug },
    });
  }
}

async function seedMaterials() {
  for (const material of materials) {
    const slug = slugify(material.name);
    await prisma.material.upsert({
      where: { slug },
      update: { name: material.name, description: material.description },
      create: { name: material.name, slug, description: material.description },
    });
  }
}

async function seedWoodTypes() {
  for (const woodType of woodTypes) {
    const slug = slugify(woodType.name);
    await prisma.woodType.upsert({
      where: { slug },
      update: {
        name: woodType.name,
        description: woodType.description,
        content: woodType.content,
      },
      create: {
        name: woodType.name,
        slug,
        description: woodType.description,
        content: woodType.content,
      },
    });
  }
}

async function seedStyles() {
  for (const style of styles) {
    const slug = slugify(style.name);
    await prisma.style.upsert({
      where: { slug },
      update: { name: style.name, description: style.description },
      create: { name: style.name, slug, description: style.description },
    });
  }
}

async function seedCategories() {
  for (const category of categories) {
    const slug = slugify(category.name);
    await prisma.category.upsert({
      where: { slug },
      update: { name: category.name, description: category.description },
      create: { name: category.name, slug, description: category.description },
    });
  }
}

async function seedDesigners() {
  for (const designer of designers) {
    const country = await prisma.country.findUnique({
      where: { isoCode: designer.countryIso },
    });
    const slug = slugify(designer.name);
    await prisma.designer.upsert({
      where: { slug },
      update: {
        name: designer.name,
        bio: designer.bio,
        content: designer.content,
        countryId: country?.id,
      },
      create: {
        name: designer.name,
        slug,
        bio: designer.bio,
        content: designer.content,
        countryId: country?.id,
      },
    });
  }
}

async function seedManufacturers() {
  for (const manufacturer of manufacturers) {
    const country = await prisma.country.findUnique({
      where: { isoCode: manufacturer.countryIso },
    });
    const slug = slugify(manufacturer.name);
    await prisma.manufacturer.upsert({
      where: { slug },
      update: {
        name: manufacturer.name,
        description: manufacturer.description,
        countryId: country?.id,
      },
      create: {
        name: manufacturer.name,
        slug,
        description: manufacturer.description,
        countryId: country?.id,
      },
    });
  }
}

async function seedDecades() {
  for (const decade of decades) {
    await prisma.decade.upsert({
      where: { value: decade.value },
      update: { label: decade.label, description: decade.description },
      create: decade,
    });
  }
}

async function seedTrends() {
  for (const trend of trends) {
    const [material, woodType, style, designer, manufacturer] = await Promise.all([
      trend.materialSlug
        ? prisma.material.findUnique({ where: { slug: trend.materialSlug } })
        : null,
      trend.woodTypeSlug
        ? prisma.woodType.findUnique({ where: { slug: trend.woodTypeSlug } })
        : null,
      trend.styleSlug ? prisma.style.findUnique({ where: { slug: trend.styleSlug } }) : null,
      trend.designerSlug
        ? prisma.designer.findUnique({ where: { slug: trend.designerSlug } })
        : null,
      trend.manufacturerSlug
        ? prisma.manufacturer.findUnique({ where: { slug: trend.manufacturerSlug } })
        : null,
    ]);

    const data = {
      title: trend.title,
      excerpt: trend.excerpt,
      body: trend.body,
      category: trend.category,
      imageUrl: trend.imageUrl,
      imageAlt: trend.imageAlt,
      imageCredit: trend.imageCredit,
      materialId: material?.id,
      woodTypeId: woodType?.id,
      styleId: style?.id,
      designerId: designer?.id,
      manufacturerId: manufacturer?.id,
      sourceUrl: trend.sourceUrl,
      sourceName: trend.sourceName,
    };

    await prisma.trend.upsert({
      where: { slug: trend.slug },
      update: data,
      create: { slug: trend.slug, ...data },
    });
  }
}

/**
 * Limpia cuentas y piezas efímeras dejadas por scripts de verificación
 * manual de sprints anteriores (patrón "explorer+<timestamp>@example.com").
 * Nunca borra cuentas reales — solo ese patrón específico.
 */
async function cleanupEphemeralVerificationData() {
  const stale = await prisma.user.findMany({
    where: { email: { startsWith: "explorer+" } },
    include: { store: true },
  });

  for (const user of stale) {
    if (user.store) {
      await prisma.furniture.deleteMany({ where: { storeId: user.store.id } });
      await prisma.store.delete({ where: { id: user.store.id } });
    }
    await prisma.user.delete({ where: { id: user.id } });
  }
}

async function seedDemoUsers(): Promise<Map<string, string>> {
  const roleRows = await prisma.role.findMany();
  const roleIdByName = new Map(roleRows.map((r) => [r.name, r.id]));
  const passwordHash = await argon2.hash(DEMO_PASSWORD, {
    type: argon2.argon2id,
  });

  const userIdByEmail = new Map<string, string>();

  for (const demoUser of demoUsers) {
    const country = await prisma.country.findUnique({
      where: { isoCode: demoUser.countryIso },
    });
    const roleId = roleIdByName.get(demoUser.role);
    if (!roleId) throw new Error(`Rol no encontrado: ${demoUser.role}`);

    const user = await prisma.user.upsert({
      where: { email: demoUser.email },
      update: {},
      create: {
        email: demoUser.email,
        passwordHash,
        emailVerifiedAt: new Date(),
        roleId,
      },
    });

    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        firstName: demoUser.firstName,
        lastName: demoUser.lastName,
        bio: demoUser.bio ?? null,
        city: demoUser.city,
        countryId: country?.id,
      },
      create: {
        userId: user.id,
        firstName: demoUser.firstName,
        lastName: demoUser.lastName,
        username: demoUser.username,
        bio: demoUser.bio ?? null,
        city: demoUser.city,
        countryId: country?.id,
      },
    });

    userIdByEmail.set(demoUser.email, user.id);
  }

  return userIdByEmail;
}

async function seedDemoStores(
  userIdByEmail: Map<string, string>,
): Promise<Map<string, string>> {
  const storeIdByName = new Map<string, string>();

  for (const demoStore of demoStores) {
    const ownerId = userIdByEmail.get(demoStore.ownerEmail);
    if (!ownerId) continue;

    const country = await prisma.country.findUnique({
      where: { isoCode: demoStore.countryIso },
    });
    const slug = slugify(demoStore.name);

    const store = await prisma.store.upsert({
      where: { ownerId },
      update: {
        name: demoStore.name,
        bio: demoStore.bio,
        isVerified: true,
        locationCity: demoStore.city,
        locationRegion: demoStore.region,
        locationCountryId: country?.id,
        websiteUrl: demoStore.websiteUrl,
        socialLinks: demoStore.socialLinks,
        schedule: demoStore.schedule,
      },
      create: {
        ownerId,
        name: demoStore.name,
        slug,
        bio: demoStore.bio,
        isVerified: true,
        locationCity: demoStore.city,
        locationRegion: demoStore.region,
        locationCountryId: country?.id,
        websiteUrl: demoStore.websiteUrl,
        socialLinks: demoStore.socialLinks,
        schedule: demoStore.schedule,
      },
    });

    storeIdByName.set(demoStore.name, store.id);
  }

  return storeIdByName;
}

async function seedDemoFurniture(
  storeIdByName: Map<string, string>,
): Promise<Map<string, string>> {
  const furnitureIdByTitle = new Map<string, string>();

  for (const item of demoFurniture) {
    const storeId = storeIdByName.get(item.storeName);
    if (!storeId) continue;

    // Secuencial a propósito: la instancia efímera de `prisma dev` usada en
    // desarrollo local es inestable ante ráfagas de queries concurrentes.
    const category = await prisma.category.findUnique({
      where: { slug: item.categorySlug },
    });
    const style = await prisma.style.findUnique({
      where: { slug: item.styleSlug },
    });
    const designer = item.designerSlug
      ? await prisma.designer.findUnique({ where: { slug: item.designerSlug } })
      : null;
    const manufacturer = item.manufacturerSlug
      ? await prisma.manufacturer.findUnique({
          where: { slug: item.manufacturerSlug },
        })
      : null;
    const originCountry = item.originCountryIso
      ? await prisma.country.findUnique({
          where: { isoCode: item.originCountryIso },
        })
      : null;
    if (!category) throw new Error(`Categoría no encontrada: ${item.categorySlug}`);

    const materialRows = await prisma.material.findMany({
      where: { slug: { in: item.materialSlugs } },
    });
    const woodTypeRows = await prisma.woodType.findMany({
      where: { slug: { in: item.woodTypeSlugs } },
    });

    const slug = slugify(item.title);

    const furniture = await prisma.furniture.upsert({
      where: { slug },
      update: {
        price: item.priceClp,
        currency: "CLP",
      },
      create: {
        storeId,
        title: item.title,
        slug,
        description: item.description,
        categoryId: category.id,
        styleId: style?.id,
        designerId: designer?.id,
        manufacturerId: manufacturer?.id,
        originCountryId: originCountry?.id,
        locationCity: item.locationCity,
        locationRegion: "Chile",
        materials: { connect: materialRows.map((m) => ({ id: m.id })) },
        woodTypes: { connect: woodTypeRows.map((w) => ({ id: w.id })) },
        condition: item.condition,
        originality: item.originality,
        decade: item.decade,
        price: item.priceClp,
        currency: "CLP",
        status: "PUBLISHED",
      },
    });

    const existingImages = await prisma.furnitureImage.count({
      where: { furnitureId: furniture.id },
    });
    if (existingImages === 0) {
      await prisma.furnitureImage.createMany({
        data: Array.from({ length: item.imageCount }, (_, index) => ({
          furnitureId: furniture.id,
          url: picsumUrl(item.imageSeed, index),
          order: index,
          width: 1200,
          height: 1500,
        })),
      });
    }

    furnitureIdByTitle.set(item.title, furniture.id);
  }

  return furnitureIdByTitle;
}

/** Datos de ejemplo para follows, favoritos, colecciones, mensajería y
 * notificaciones — demuestran que las funcionalidades del Sprint 8-9
 * quedan realmente cableadas de extremo a extremo, no solo en el schema. */
async function seedDemoCommunity(
  userIdByEmail: Map<string, string>,
  storeIdByName: Map<string, string>,
  furnitureIdByTitle: Map<string, string>,
) {
  const maria = userIdByEmail.get("maria.soto@nogal.cl")!;
  const tomas = userIdByEmail.get("tomas.bravo@nogal.cl")!;
  const javiera = userIdByEmail.get("javiera.munoz@example.com")!;
  const ignacio = userIdByEmail.get("ignacio.rojas@example.com")!;
  const casaNogalId = storeIdByName.get("Atelier Casa Nogal")!;

  const sillaWegner = furnitureIdByTitle.get("Silla Wegner en roble")!;
  const mesaCentro = furnitureIdByTitle.get("Mesa de centro en nogal")!;
  const comodaArtDeco = furnitureIdByTitle.get("Cómoda Art Déco en cedro")!;
  const escritorioPonti = furnitureIdByTitle.get("Escritorio Ponti en teca")!;
  const lamparaArtDeco = furnitureIdByTitle.get(
    "Lámpara de piso Art Déco en latón",
  )!;

  // --- Follows: Javiera e Ignacio siguen a las dos tiendas/vendedores ---
  const follows: Array<[string, string]> = [
    [javiera, maria],
    [javiera, tomas],
    [ignacio, maria],
  ];
  for (const [followerId, followingId] of follows) {
    await prisma.follow.upsert({
      where: { followerId_followingId: { followerId, followingId } },
      update: {},
      create: { followerId, followingId },
    });
  }
  await prisma.profile.update({
    where: { userId: maria },
    data: { followersCount: 2 },
  });
  await prisma.profile.update({
    where: { userId: tomas },
    data: { followersCount: 1 },
  });
  await prisma.profile.update({
    where: { userId: javiera },
    data: { followingCount: 2 },
  });
  await prisma.profile.update({
    where: { userId: ignacio },
    data: { followingCount: 1 },
  });

  // --- Favoritos ---
  const favorites: Array<[string, string]> = [
    [javiera, sillaWegner],
    [javiera, escritorioPonti],
    [ignacio, comodaArtDeco],
  ];
  for (const [userId, furnitureId] of favorites) {
    await prisma.favorite.upsert({
      where: { userId_furnitureId: { userId, furnitureId } },
      update: {},
      create: { userId, furnitureId },
    });
  }
  await prisma.profile.update({
    where: { userId: maria },
    data: { favoritesCount: 2 },
  });
  await prisma.profile.update({
    where: { userId: tomas },
    data: { favoritesCount: 1 },
  });

  // --- Colección personal de Javiera ---
  const existingCollection = await prisma.collection.findFirst({
    where: { ownerId: javiera, storeId: null, name: "Mi Living" },
  });
  const miLiving =
    existingCollection ??
    (await prisma.collection.create({
      data: {
        ownerId: javiera,
        name: "Mi Living",
        description: "Piezas que quiero para renovar el living.",
      },
    }));
  for (const furnitureId of [mesaCentro, lamparaArtDeco]) {
    await prisma.collectionItem.upsert({
      where: {
        collectionId_furnitureId: { collectionId: miLiving.id, furnitureId },
      },
      update: {},
      create: { collectionId: miLiving.id, furnitureId },
    });
  }

  // --- Colección de la tienda (merchandising) ---
  const existingStoreCollection = await prisma.collection.findFirst({
    where: { storeId: casaNogalId, name: "Selección Mid-Century" },
  });
  const seleccion =
    existingStoreCollection ??
    (await prisma.collection.create({
      data: {
        ownerId: maria,
        storeId: casaNogalId,
        name: "Selección Mid-Century",
        description: "Nuestras piezas favoritas de mediados de siglo.",
      },
    }));
  for (const furnitureId of [sillaWegner, mesaCentro, escritorioPonti]) {
    await prisma.collectionItem.upsert({
      where: {
        collectionId_furnitureId: { collectionId: seleccion.id, furnitureId },
      },
      update: {},
      create: { collectionId: seleccion.id, furnitureId },
    });
  }

  // --- Conversación + mensajes sobre la Silla Wegner ---
  const conversation = await prisma.conversation.upsert({
    where: {
      furnitureId_buyerId: { furnitureId: sillaWegner, buyerId: javiera },
    },
    update: {},
    create: {
      furnitureId: sillaWegner,
      buyerId: javiera,
      storeId: casaNogalId,
    },
  });

  const existingMessages = await prisma.message.count({
    where: { conversationId: conversation.id },
  });
  if (existingMessages === 0) {
    const firstMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: javiera,
        body: "Hola, ¿la silla Wegner sigue disponible? ¿Aceptas envío a Providencia?",
        deliveredAt: new Date(),
        readAt: new Date(),
      },
    });
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: maria,
        body: "¡Hola Javiera! Sí, sigue disponible. Hacemos envío a todo Santiago sin costo adicional.",
        deliveredAt: new Date(),
      },
    });

    await prisma.notification.create({
      data: {
        userId: maria,
        type: "NEW_MESSAGE",
        payload: {
          conversationId: conversation.id,
          messageId: firstMessage.id,
          preview: firstMessage.body.slice(0, 120),
        },
      },
    });
  }

  await prisma.notification.createMany({
    data: [
      {
        userId: maria,
        type: "NEW_FOLLOWER",
        payload: { followerId: javiera },
      },
      {
        userId: maria,
        type: "FURNITURE_FAVORITED",
        payload: { furnitureId: sillaWegner, userId: javiera },
      },
    ],
    skipDuplicates: true,
  });
}

async function main() {
  await seedRoles();
  await seedCountries();
  await seedCategories();
  await seedMaterials();
  await seedWoodTypes();
  await seedStyles();
  await seedDesigners();
  await seedManufacturers();
  await seedDecades();
  await seedTrends();

  await cleanupEphemeralVerificationData();

  const userIdByEmail = await seedDemoUsers();
  const storeIdByName = await seedDemoStores(userIdByEmail);
  const furnitureIdByTitle = await seedDemoFurniture(storeIdByName);
  await seedDemoCommunity(userIdByEmail, storeIdByName, furnitureIdByTitle);

  console.log("Seed completado.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
