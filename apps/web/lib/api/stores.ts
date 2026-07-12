import "server-only";
import { gql } from "graphql-request";
import { createApiClient } from "./client";
import type { Store, StoreProfile } from "./types";

const MY_STORE_QUERY = gql`
  query MyStore {
    myStore {
      id
      name
      slug
      bio
      isVerified
      createdAt
    }
  }
`;

const CREATE_STORE_MUTATION = gql`
  mutation CreateStore($input: CreateStoreInput!) {
    createStore(input: $input) {
      id
      name
      slug
      bio
      isVerified
      createdAt
    }
  }
`;

const STORE_PROFILE_FIELDS = gql`
  fragment StoreProfileFields on StoreEntity {
    id
    name
    slug
    bio
    isVerified
    logoUrl
    bannerUrl
    websiteUrl
    socialLinks {
      key
      value
    }
    schedule {
      key
      value
    }
    locationCity
    locationRegion
    locationCountry {
      id
      name
      isoCode
    }
    ownerId
    ownerUsername
    pieceCount
    followersCount
    createdAt
  }
`;

const STORE_BY_SLUG_QUERY = gql`
  ${STORE_PROFILE_FIELDS}
  query StoreBySlug($slug: String!) {
    storeBySlug(slug: $slug) {
      ...StoreProfileFields
    }
  }
`;

export async function fetchMyStore(accessToken: string): Promise<Store | null> {
  const client = createApiClient(accessToken);
  const data = await client.request<{ myStore: Store | null }>(MY_STORE_QUERY);
  return data.myStore;
}

export async function fetchStoreBySlug(
  slug: string,
): Promise<StoreProfile | null> {
  const client = createApiClient();
  const data = await client.request<{ storeBySlug: StoreProfile | null }>(
    STORE_BY_SLUG_QUERY,
    { slug },
  );
  return data.storeBySlug;
}

export async function createStore(
  accessToken: string,
  name: string,
): Promise<Store> {
  const client = createApiClient(accessToken);
  const data = await client.request<{ createStore: Store }>(
    CREATE_STORE_MUTATION,
    { input: { name } },
  );
  return data.createStore;
}
