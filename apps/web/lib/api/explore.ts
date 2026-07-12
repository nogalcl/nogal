import "server-only";
import { gql } from "graphql-request";
import { createApiClient } from "./client";
import type {
  FurnitureConnection,
  FurnitureFilter,
  FurnitureSort,
} from "./types";

const EXPLORE_QUERY = gql`
  query ExploreFurniture($filter: FurnitureFilterInput, $sort: FurnitureSort) {
    exploreFurniture(filter: $filter, sort: $sort) {
      total
      page
      perPage
      totalPages
      items {
        id
        title
        slug
        price
        currency
        decade
        condition
        locationCity
        categoryName
        categorySlug
        primaryMaterial
        primaryImage {
          url
          altText
          width
          height
        }
      }
    }
  }
`;

const LOCATIONS_QUERY = gql`
  query FurnitureLocations {
    furnitureLocations
  }
`;

export async function exploreFurniture(
  filter: FurnitureFilter,
  sort?: FurnitureSort,
): Promise<FurnitureConnection> {
  const client = createApiClient();
  const data = await client.request<{ exploreFurniture: FurnitureConnection }>(
    EXPLORE_QUERY,
    { filter, sort },
  );
  return data.exploreFurniture;
}

export async function fetchFurnitureLocations(): Promise<string[]> {
  const client = createApiClient();
  const data = await client.request<{ furnitureLocations: string[] }>(
    LOCATIONS_QUERY,
  );
  return data.furnitureLocations;
}
