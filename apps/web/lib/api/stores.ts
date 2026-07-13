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

const STORES_QUERY = gql`
  ${STORE_PROFILE_FIELDS}
  query Stores {
    stores {
      ...StoreProfileFields
    }
  }
`;

export async function fetchMyStore(accessToken: string): Promise<Store> {
  const client = createApiClient(accessToken);
  const data = await client.request<{ myStore: Store }>(MY_STORE_QUERY);
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

export async function fetchStores(): Promise<StoreProfile[]> {
  const client = createApiClient();
  const data = await client.request<{ stores: StoreProfile[] }>(STORES_QUERY);
  return data.stores;
}
