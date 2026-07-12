import "server-only";
import { gql } from "graphql-request";
import { createApiClient } from "./client";
import type { Trend, TrendCategory, TrendPreview } from "./types";

const TRENDS_QUERY = gql`
  query Trends($category: TrendCategory) {
    trends(category: $category) {
      id
      slug
      title
      excerpt
      category
      imageUrl
      imageAlt
      publishedAt
      material {
        id
        name
        slug
      }
      woodType {
        id
        name
        slug
      }
      style {
        id
        name
        slug
      }
      designer {
        id
        name
        slug
      }
      manufacturer {
        id
        name
        slug
      }
    }
  }
`;

const TREND_BY_SLUG_QUERY = gql`
  query TrendBySlug($slug: String!) {
    trendBySlug(slug: $slug) {
      id
      slug
      title
      excerpt
      body
      category
      imageUrl
      imageAlt
      imageCredit
      publishedAt
      sourceUrl
      sourceName
      material {
        id
        name
        slug
      }
      woodType {
        id
        name
        slug
      }
      style {
        id
        name
        slug
      }
      designer {
        id
        name
        slug
      }
      manufacturer {
        id
        name
        slug
      }
    }
  }
`;

export async function fetchTrends(category?: TrendCategory): Promise<TrendPreview[]> {
  const client = createApiClient();
  const data = await client.request<{ trends: TrendPreview[] }>(TRENDS_QUERY, {
    category,
  });
  return data.trends;
}

export async function fetchTrendBySlug(slug: string): Promise<Trend | null> {
  const client = createApiClient();
  const data = await client.request<{ trendBySlug: Trend | null }>(TREND_BY_SLUG_QUERY, {
    slug,
  });
  return data.trendBySlug;
}
