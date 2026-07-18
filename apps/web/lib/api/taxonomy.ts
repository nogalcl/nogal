import "server-only";
import { gql, type Variables } from "graphql-request";
import { createApiClient } from "./client";
import type {
  Category,
  CountryDetail,
  Country,
  Decade,
  Designer,
  Manufacturer,
  TaxonomyTerm,
} from "./types";

// Estas son todas lecturas públicas usadas por páginas de catálogo/base de
// conocimiento que Next intenta generar de forma estática en build time. Si
// la base de datos no responde en ese momento (mantenimiento, caída), una
// sola de estas páginas revienta el build completo — así que acá se
// degradan a un valor vacío en vez de tumbar el despliegue entero por un
// listado no crítico.
async function safeRequest<T>(
  query: string,
  variables: Variables | undefined,
  fallback: T,
): Promise<T> {
  try {
    const client = createApiClient();
    return await client.request<T>(query, variables);
  } catch (error) {
    console.error("[taxonomy] fetch falló, usando valor por defecto:", error);
    return fallback;
  }
}

export interface TaxonomyOptions {
  categories: Category[];
  materials: TaxonomyTerm[];
  woodTypes: TaxonomyTerm[];
  styles: TaxonomyTerm[];
  designers: Designer[];
  manufacturers: Manufacturer[];
  countries: Country[];
}

const TAXONOMY_QUERY = gql`
  query TaxonomyOptions {
    categories {
      id
      name
      slug
      description
      parentId
    }
    materials {
      id
      name
      slug
      description
    }
    woodTypes {
      id
      name
      slug
      description
    }
    styles {
      id
      name
      slug
      description
    }
    designers {
      id
      name
      slug
      bio
      country {
        id
        name
        isoCode
        slug
      }
    }
    manufacturers {
      id
      name
      slug
      description
      country {
        id
        name
        isoCode
        slug
      }
    }
    countries {
      id
      name
      isoCode
      slug
      description
    }
  }
`;

export async function fetchTaxonomyOptions(): Promise<TaxonomyOptions> {
  return safeRequest<TaxonomyOptions>(TAXONOMY_QUERY, undefined, {
    categories: [],
    materials: [],
    woodTypes: [],
    styles: [],
    designers: [],
    manufacturers: [],
    countries: [],
  });
}

const CATEGORY_BY_SLUG_QUERY = gql`
  query CategoryBySlug($slug: String!) {
    categoryBySlug(slug: $slug) {
      id
      name
      slug
      description
      content
      parentId
      pieceCount
      relatedDesigners {
        id
        name
        slug
      }
      relatedMaterials {
        id
        name
        slug
      }
    }
  }
`;

const MATERIAL_BY_SLUG_QUERY = gql`
  query MaterialBySlug($slug: String!) {
    materialBySlug(slug: $slug) {
      id
      name
      slug
      description
      content
      pieceCount
      valuationMentionCount
      relatedDesigners {
        id
        name
        slug
      }
      relatedManufacturers {
        id
        name
        slug
      }
    }
  }
`;

const WOOD_TYPE_BY_SLUG_QUERY = gql`
  query WoodTypeBySlug($slug: String!) {
    woodTypeBySlug(slug: $slug) {
      id
      name
      slug
      description
      content
      pieceCount
      valuationMentionCount
      relatedDesigners {
        id
        name
        slug
      }
      relatedManufacturers {
        id
        name
        slug
      }
    }
  }
`;

const STYLE_BY_SLUG_QUERY = gql`
  query StyleBySlug($slug: String!) {
    styleBySlug(slug: $slug) {
      id
      name
      slug
      description
      content
      pieceCount
      valuationMentionCount
      relatedDesigners {
        id
        name
        slug
      }
      relatedManufacturers {
        id
        name
        slug
      }
    }
  }
`;

const DESIGNER_BY_SLUG_QUERY = gql`
  query DesignerBySlug($slug: String!) {
    designerBySlug(slug: $slug) {
      id
      name
      slug
      bio
      content
      pieceCount
      valuationMentionCount
      country {
        id
        name
        isoCode
        slug
      }
      relatedMaterials {
        id
        name
        slug
      }
      relatedStyles {
        id
        name
        slug
      }
    }
  }
`;

const MANUFACTURER_BY_SLUG_QUERY = gql`
  query ManufacturerBySlug($slug: String!) {
    manufacturerBySlug(slug: $slug) {
      id
      name
      slug
      description
      content
      pieceCount
      valuationMentionCount
      country {
        id
        name
        isoCode
        slug
      }
      relatedMaterials {
        id
        name
        slug
      }
      relatedStyles {
        id
        name
        slug
      }
    }
  }
`;

const COUNTRY_BY_SLUG_QUERY = gql`
  query CountryBySlug($slug: String!) {
    countryBySlug(slug: $slug) {
      id
      name
      isoCode
      slug
      description
      content
      pieceCount
      relatedDesigners {
        id
        name
        slug
      }
      relatedManufacturers {
        id
        name
        slug
      }
    }
  }
`;

const DECADES_QUERY = gql`
  query Decades {
    decades {
      id
      value
      label
      description
    }
  }
`;

const DECADE_BY_VALUE_QUERY = gql`
  query DecadeByValue($value: Int!) {
    decadeByValue(value: $value) {
      id
      value
      label
      description
      content
      pieceCount
      relatedDesigners {
        id
        name
        slug
      }
      relatedMaterials {
        id
        name
        slug
      }
      relatedStyles {
        id
        name
        slug
      }
    }
  }
`;

export async function fetchCategoryBySlug(slug: string): Promise<Category | null> {
  const data = await safeRequest<{ categoryBySlug: Category | null }>(
    CATEGORY_BY_SLUG_QUERY,
    { slug },
    { categoryBySlug: null },
  );
  return data.categoryBySlug;
}

export async function fetchMaterialBySlug(slug: string): Promise<TaxonomyTerm | null> {
  const data = await safeRequest<{ materialBySlug: TaxonomyTerm | null }>(
    MATERIAL_BY_SLUG_QUERY,
    { slug },
    { materialBySlug: null },
  );
  return data.materialBySlug;
}

export async function fetchWoodTypeBySlug(slug: string): Promise<TaxonomyTerm | null> {
  const data = await safeRequest<{ woodTypeBySlug: TaxonomyTerm | null }>(
    WOOD_TYPE_BY_SLUG_QUERY,
    { slug },
    { woodTypeBySlug: null },
  );
  return data.woodTypeBySlug;
}

export async function fetchStyleBySlug(slug: string): Promise<TaxonomyTerm | null> {
  const data = await safeRequest<{ styleBySlug: TaxonomyTerm | null }>(
    STYLE_BY_SLUG_QUERY,
    { slug },
    { styleBySlug: null },
  );
  return data.styleBySlug;
}

export async function fetchDesignerBySlug(slug: string): Promise<Designer | null> {
  const data = await safeRequest<{ designerBySlug: Designer | null }>(
    DESIGNER_BY_SLUG_QUERY,
    { slug },
    { designerBySlug: null },
  );
  return data.designerBySlug;
}

export async function fetchManufacturerBySlug(
  slug: string,
): Promise<Manufacturer | null> {
  const data = await safeRequest<{ manufacturerBySlug: Manufacturer | null }>(
    MANUFACTURER_BY_SLUG_QUERY,
    { slug },
    { manufacturerBySlug: null },
  );
  return data.manufacturerBySlug;
}

export async function fetchCountryBySlug(slug: string): Promise<CountryDetail | null> {
  const data = await safeRequest<{ countryBySlug: CountryDetail | null }>(
    COUNTRY_BY_SLUG_QUERY,
    { slug },
    { countryBySlug: null },
  );
  return data.countryBySlug;
}

export async function fetchDecades(): Promise<Decade[]> {
  const data = await safeRequest<{ decades: Decade[] }>(
    DECADES_QUERY,
    undefined,
    { decades: [] },
  );
  return data.decades;
}

export async function fetchDecadeByValue(value: number): Promise<Decade | null> {
  const data = await safeRequest<{ decadeByValue: Decade | null }>(
    DECADE_BY_VALUE_QUERY,
    { value },
    { decadeByValue: null },
  );
  return data.decadeByValue;
}
