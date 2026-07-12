import "server-only";
import { gql } from "graphql-request";
import { createApiClient } from "./client";
import type { CollectionSummary } from "./types";

const COLLECTION_FIELDS = gql`
  fragment CollectionFields on CollectionEntity {
    id
    name
    description
    storeId
    itemCount
    createdAt
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
`;

const MY_COLLECTIONS_QUERY = gql`
  ${COLLECTION_FIELDS}
  query MyCollections {
    myCollections {
      ...CollectionFields
    }
  }
`;

const STORE_COLLECTIONS_QUERY = gql`
  ${COLLECTION_FIELDS}
  query StoreCollections($storeId: String!) {
    storeCollections(storeId: $storeId) {
      ...CollectionFields
    }
  }
`;

const CREATE_COLLECTION_MUTATION = gql`
  ${COLLECTION_FIELDS}
  mutation CreateCollection($input: CreateCollectionInput!) {
    createCollection(input: $input) {
      ...CollectionFields
    }
  }
`;

const RENAME_COLLECTION_MUTATION = gql`
  ${COLLECTION_FIELDS}
  mutation RenameCollection($id: String!, $name: String!, $description: String) {
    renameCollection(id: $id, name: $name, description: $description) {
      ...CollectionFields
    }
  }
`;

const DELETE_COLLECTION_MUTATION = gql`
  mutation DeleteCollection($id: String!) {
    deleteCollection(id: $id)
  }
`;

const ADD_TO_COLLECTION_MUTATION = gql`
  ${COLLECTION_FIELDS}
  mutation AddToCollection($id: String!, $furnitureId: String!) {
    addToCollection(id: $id, furnitureId: $furnitureId) {
      ...CollectionFields
    }
  }
`;

const REMOVE_FROM_COLLECTION_MUTATION = gql`
  ${COLLECTION_FIELDS}
  mutation RemoveFromCollection($id: String!, $furnitureId: String!) {
    removeFromCollection(id: $id, furnitureId: $furnitureId) {
      ...CollectionFields
    }
  }
`;

export async function fetchMyCollections(
  accessToken: string,
): Promise<CollectionSummary[]> {
  const client = createApiClient(accessToken);
  const data = await client.request<{ myCollections: CollectionSummary[] }>(
    MY_COLLECTIONS_QUERY,
  );
  return data.myCollections;
}

export async function fetchStoreCollections(
  storeId: string,
): Promise<CollectionSummary[]> {
  const client = createApiClient();
  const data = await client.request<{
    storeCollections: CollectionSummary[];
  }>(STORE_COLLECTIONS_QUERY, { storeId });
  return data.storeCollections;
}

export async function createCollection(
  accessToken: string,
  input: { name: string; description?: string; storeId?: string },
): Promise<CollectionSummary> {
  const client = createApiClient(accessToken);
  const data = await client.request<{ createCollection: CollectionSummary }>(
    CREATE_COLLECTION_MUTATION,
    { input },
  );
  return data.createCollection;
}

export async function renameCollection(
  accessToken: string,
  id: string,
  name: string,
  description?: string,
): Promise<CollectionSummary> {
  const client = createApiClient(accessToken);
  const data = await client.request<{ renameCollection: CollectionSummary }>(
    RENAME_COLLECTION_MUTATION,
    { id, name, description },
  );
  return data.renameCollection;
}

export async function deleteCollection(
  accessToken: string,
  id: string,
): Promise<void> {
  const client = createApiClient(accessToken);
  await client.request(DELETE_COLLECTION_MUTATION, { id });
}

export async function addToCollection(
  accessToken: string,
  id: string,
  furnitureId: string,
): Promise<CollectionSummary> {
  const client = createApiClient(accessToken);
  const data = await client.request<{ addToCollection: CollectionSummary }>(
    ADD_TO_COLLECTION_MUTATION,
    { id, furnitureId },
  );
  return data.addToCollection;
}

export async function removeFromCollection(
  accessToken: string,
  id: string,
  furnitureId: string,
): Promise<CollectionSummary> {
  const client = createApiClient(accessToken);
  const data = await client.request<{ removeFromCollection: CollectionSummary }>(
    REMOVE_FROM_COLLECTION_MUTATION,
    { id, furnitureId },
  );
  return data.removeFromCollection;
}
