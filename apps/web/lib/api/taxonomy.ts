import "server-only";
import { gql } from "graphql-request";
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
  const client = createApiClient();
  return client.request<TaxonomyOptions>(TAXONOMY_QUERY);
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
  const client = createApiClient();
  const data = await client.request<{ categoryBySlug: Category | null }>(
    CATEGORY_BY_SLUG_QUERY,
    { slug },
  );
  return data.categoryBySlug;
}

export async function fetchMaterialBySlug(slug: string): Promise<TaxonomyTerm | null> {
  const client = createApiClient();
  const data = await client.request<{ materialBySlug: TaxonomyTerm | null }>(
    MATERIAL_BY_SLUG_QUERY,
    { slug },
  );
  return data.materialBySlug;
}

export async function fetchWoodTypeBySlug(slug: string): Promise<TaxonomyTerm | null> {
  const client = createApiClient();
  const data = await client.request<{ woodTypeBySlug: TaxonomyTerm | null }>(
    WOOD_TYPE_BY_SLUG_QUERY,
    { slug },
  );
  return data.woodTypeBySlug;
}

export async function fetchStyleBySlug(slug: string): Promise<TaxonomyTerm | null> {
  const client = createApiClient();
  const data = await client.request<{ styleBySlug: TaxonomyTerm | null }>(
    STYLE_BY_SLUG_QUERY,
    { slug },
  );
  return data.styleBySlug;
}

export async function fetchDesignerBySlug(slug: string): Promise<Designer | null> {
  const client = createApiClient();
  const data = await client.request<{ designerBySlug: Designer | null }>(
    DESIGNER_BY_SLUG_QUERY,
    { slug },
  );
  return data.designerBySlug;
}

export async function fetchManufacturerBySlug(
  slug: string,
): Promise<Manufacturer | null> {
  const client = createApiClient();
  const data = await client.request<{ manufacturerBySlug: Manufacturer | null }>(
    MANUFACTURER_BY_SLUG_QUERY,
    { slug },
  );
  return data.manufacturerBySlug;
}

export async function fetchCountryBySlug(slug: string): Promise<CountryDetail | null> {
  const client = createApiClient();
  const data = await client.request<{ countryBySlug: CountryDetail | null }>(
    COUNTRY_BY_SLUG_QUERY,
    { slug },
  );
  return data.countryBySlug;
}

export async function fetchDecades(): Promise<Decade[]> {
  const client = createApiClient();
  const data = await client.request<{ decades: Decade[] }>(DECADES_QUERY);
  return data.decades;
}

export async function fetchDecadeByValue(value: number): Promise<Decade | null> {
  const client = createApiClient();
  const data = await client.request<{ decadeByValue: Decade | null }>(
    DECADE_BY_VALUE_QUERY,
    { value },
  );
  return data.decadeByValue;
}
