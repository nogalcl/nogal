import "server-only";
import { gql } from "graphql-request";
import { createApiClient } from "./client";
import type { FurnitureConnection } from "./types";

const FAVORITE_PREVIEW_FIELDS = gql`
  fragment FavoritePreviewFields on FurniturePreviewEntity {
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
`;

const MY_FAVORITES_QUERY = gql`
  ${FAVORITE_PREVIEW_FIELDS}
  query MyFavorites($page: Int) {
    myFavorites(page: $page) {
      total
      page
      totalPages
      items {
        ...FavoritePreviewFields
      }
    }
  }
`;

const ADD_FAVORITE_MUTATION = gql`
  mutation AddFavorite($furnitureId: String!) {
    addFavorite(furnitureId: $furnitureId)
  }
`;

const REMOVE_FAVORITE_MUTATION = gql`
  mutation RemoveFavorite($furnitureId: String!) {
    removeFavorite(furnitureId: $furnitureId)
  }
`;

const IS_FAVORITED_QUERY = gql`
  query IsFavorited($furnitureId: String!) {
    isFavorited(furnitureId: $furnitureId)
  }
`;

export async function fetchMyFavorites(
  accessToken: string,
  page = 1,
): Promise<Omit<FurnitureConnection, "perPage">> {
  const client = createApiClient(accessToken);
  const data = await client.request<{
    myFavorites: Omit<FurnitureConnection, "perPage">;
  }>(MY_FAVORITES_QUERY, { page });
  return data.myFavorites;
}

export async function fetchIsFavorited(
  accessToken: string,
  furnitureId: string,
): Promise<boolean> {
  const client = createApiClient(accessToken);
  const data = await client.request<{ isFavorited: boolean }>(
    IS_FAVORITED_QUERY,
    { furnitureId },
  );
  return data.isFavorited;
}

export async function addFavorite(
  accessToken: string,
  furnitureId: string,
): Promise<void> {
  const client = createApiClient(accessToken);
  await client.request(ADD_FAVORITE_MUTATION, { furnitureId });
}

export async function removeFavorite(
  accessToken: string,
  furnitureId: string,
): Promise<void> {
  const client = createApiClient(accessToken);
  await client.request(REMOVE_FAVORITE_MUTATION, { furnitureId });
}
