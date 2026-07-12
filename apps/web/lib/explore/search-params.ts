import type { TaxonomyOptions } from "@/lib/api/taxonomy";
import type { FurnitureFilter, FurnitureSort } from "@/lib/api/types";

/**
 * Todo el estado del explorador vive en la URL (?material=roble&estilo=mid-century-modern),
 * nunca en estado de cliente — así las búsquedas son compartibles, indexables
 * y sobreviven a un refresco de página.
 */
export type ExploreSearchParams = Record<string, string | string[] | undefined>;

const ORIGINALITY_TO_URL: Record<string, string> = {
  ORIGINAL: "original",
  REPRODUCTION: "reproduccion",
};
const URL_TO_ORIGINALITY = invert(ORIGINALITY_TO_URL);

const AVAILABILITY_TO_URL: Record<string, string> = {
  PUBLISHED: "disponible",
  RESERVED: "reservada",
};
const URL_TO_AVAILABILITY = invert(AVAILABILITY_TO_URL);

const SORT_TO_URL: Record<FurnitureSort, string> = {
  RECENT: "recientes",
  OLDEST: "antiguos",
  PRICE_ASC: "precio_asc",
  PRICE_DESC: "precio_desc",
  MOST_VIEWED: "mas_vistos",
  MOST_SAVED: "mas_guardados",
};
const URL_TO_SORT = invert(SORT_TO_URL) as Record<string, FurnitureSort>;

function invert(map: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k]));
}

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function idsBySlug(
  slugs: string[],
  terms: Array<{ id: string; slug: string }>,
): string[] {
  return slugs
    .map((slug) => terms.find((t) => t.slug === slug)?.id)
    .filter((id): id is string => Boolean(id));
}

function idsByIsoCode(
  codes: string[],
  countries: TaxonomyOptions["countries"],
) {
  return codes
    .map(
      (code) =>
        countries.find((c) => c.isoCode.toLowerCase() === code.toLowerCase())
          ?.id,
    )
    .filter((id): id is string => Boolean(id));
}

export interface ParsedExploreParams {
  filter: FurnitureFilter;
  sort: FurnitureSort;
}

/** Traduce los parámetros legibles de la URL (slugs) a IDs para la API. */
export function parseExploreParams(
  params: ExploreSearchParams,
  taxonomy: TaxonomyOptions,
): ParsedExploreParams {
  const q = typeof params.q === "string" ? params.q : undefined;

  const categoryIds = idsBySlug(toArray(params.categoria), taxonomy.categories);
  const materialIds = idsBySlug(toArray(params.material), taxonomy.materials);
  const woodTypeIds = idsBySlug(toArray(params.madera), taxonomy.woodTypes);
  const styleIds = idsBySlug(toArray(params.estilo), taxonomy.styles);
  const designerIds = idsBySlug(toArray(params.disenador), taxonomy.designers);
  const manufacturerIds = idsBySlug(
    toArray(params.fabricante),
    taxonomy.manufacturers,
  );
  const originCountryIds = idsByIsoCode(
    toArray(params.pais),
    taxonomy.countries,
  );

  const decades = toArray(params.decada)
    .map((d) => Number.parseInt(d, 10))
    .filter((d) => Number.isFinite(d));

  const conditions = toArray(params.estado).map((v) =>
    v.toUpperCase(),
  ) as FurnitureFilter["conditions"];

  const originality = toArray(params.originalidad)
    .map((v) => URL_TO_ORIGINALITY[v])
    .filter(Boolean) as FurnitureFilter["originality"];

  const availability = toArray(params.disponibilidad)
    .map((v) => URL_TO_AVAILABILITY[v])
    .filter(Boolean) as FurnitureFilter["availability"];

  const priceMin =
    typeof params.precio_min === "string"
      ? Number(params.precio_min)
      : undefined;
  const priceMax =
    typeof params.precio_max === "string"
      ? Number(params.precio_max)
      : undefined;

  const locationCity =
    typeof params.ciudad === "string" ? params.ciudad : undefined;
  const locationRegion =
    typeof params.region === "string" ? params.region : undefined;

  const page = typeof params.pagina === "string" ? Number(params.pagina) : 1;

  const sortParam = typeof params.orden === "string" ? params.orden : undefined;
  const sort: FurnitureSort = (sortParam && URL_TO_SORT[sortParam]) || "RECENT";

  return {
    filter: {
      q,
      categoryIds: categoryIds.length ? categoryIds : undefined,
      materialIds: materialIds.length ? materialIds : undefined,
      woodTypeIds: woodTypeIds.length ? woodTypeIds : undefined,
      styleIds: styleIds.length ? styleIds : undefined,
      designerIds: designerIds.length ? designerIds : undefined,
      manufacturerIds: manufacturerIds.length ? manufacturerIds : undefined,
      originCountryIds: originCountryIds.length ? originCountryIds : undefined,
      decades: decades.length ? decades : undefined,
      conditions: conditions?.length ? conditions : undefined,
      originality: originality?.length ? originality : undefined,
      availability: availability?.length ? availability : undefined,
      priceMin: Number.isFinite(priceMin) ? priceMin : undefined,
      priceMax: Number.isFinite(priceMax) ? priceMax : undefined,
      locationCity,
      locationRegion,
      page: Number.isFinite(page) && page > 0 ? page : 1,
      perPage: 24,
    },
    sort,
  };
}

/** Construye la query string para un enlace de filtro (?material=roble&...). */
export function buildExploreHref(
  base: string,
  params: ExploreSearchParams,
  overrides: Record<string, string | string[] | null | undefined>,
): string {
  const merged: Record<string, string | string[]> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) merged[key] = value;
  }
  for (const [key, value] of Object.entries(overrides)) {
    if (value === null || value === undefined) delete merged[key];
    else merged[key] = value;
  }
  // Cambiar un filtro siempre vuelve a la página 1.
  if (!("pagina" in overrides)) delete merged.pagina;

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    for (const v of Array.isArray(value) ? value : [value]) {
      search.append(key, v);
    }
  }

  const qs = search.toString();
  return qs ? `${base}?${qs}` : base;
}

export function sortToUrlValue(sort: FurnitureSort): string {
  return SORT_TO_URL[sort];
}

export const SORT_OPTIONS: Array<{ value: FurnitureSort; label: string }> = [
  { value: "RECENT", label: "Más recientes" },
  { value: "OLDEST", label: "Más antiguos" },
  { value: "PRICE_ASC", label: "Precio: menor a mayor" },
  { value: "PRICE_DESC", label: "Precio: mayor a menor" },
  { value: "MOST_VIEWED", label: "Más vistos" },
  { value: "MOST_SAVED", label: "Más guardados" },
];
