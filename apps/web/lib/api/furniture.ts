import "server-only";
import { gql } from "graphql-request";
import { createApiClient } from "./client";
import type { Furniture, FurnitureImage } from "./types";

const FURNITURE_FIELDS = gql`
  fragment FurnitureFields on FurnitureEntity {
    id
    title
    slug
    description
    status
    rejectionReason
    category {
      id
      name
      slug
      parentId
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
      bio
      country {
        id
        name
        isoCode
      }
    }
    manufacturer {
      id
      name
      slug
      country {
        id
        name
        isoCode
      }
    }
    originCountry {
      id
      name
      isoCode
    }
    materials {
      id
      name
      slug
    }
    woodTypes {
      id
      name
      slug
    }
    condition
    conditionNotes
    originality
    color
    decade
    widthCm
    heightCm
    depthCm
    weightKg
    price
    currency
    priceType
    shippingMethods
    locationCity
    locationRegion
    locationCountry {
      id
      name
      isoCode
    }
    images {
      id
      url
      altText
      order
      width
      height
    }
    store {
      id
      name
      slug
      bio
      isVerified
      createdAt
    }
    viewCount
    createdAt
    updatedAt
  }
`;

const FURNITURE_BY_SLUG_QUERY = gql`
  ${FURNITURE_FIELDS}
  query FurnitureBySlug($slug: String!) {
    furniture(slug: $slug) {
      ...FurnitureFields
    }
  }
`;

const MY_FURNITURE_QUERY = gql`
  ${FURNITURE_FIELDS}
  query MyFurniture {
    myFurniture {
      ...FurnitureFields
    }
  }
`;

const FURNITURE_BY_ID_QUERY = gql`
  ${FURNITURE_FIELDS}
  query FurnitureById($id: String!) {
    furnitureById(id: $id) {
      ...FurnitureFields
    }
  }
`;

const CREATE_FURNITURE_MUTATION = gql`
  ${FURNITURE_FIELDS}
  mutation CreateFurniture($input: CreateFurnitureInput!) {
    createFurniture(input: $input) {
      ...FurnitureFields
    }
  }
`;

const UPDATE_FURNITURE_MUTATION = gql`
  ${FURNITURE_FIELDS}
  mutation UpdateFurniture($input: UpdateFurnitureInput!) {
    updateFurniture(input: $input) {
      ...FurnitureFields
    }
  }
`;

export type FurnitureInput = {
  title: string;
  description: string;
  categoryId: string;
  styleId?: string;
  designerId?: string;
  manufacturerId?: string;
  originCountryId?: string;
  materialIds?: string[];
  woodTypeIds?: string[];
  condition: string;
  conditionNotes?: string;
  originality?: string;
  color?: string;
  decade?: number;
  widthCm?: number;
  heightCm?: number;
  depthCm?: number;
  weightKg?: number;
  price: number;
  currency?: string;
  priceType?: string;
  shippingMethods?: string[];
  locationCity?: string;
  locationRegion?: string;
  locationCountryId?: string;
};

export async function fetchFurnitureBySlug(
  slug: string,
  accessToken?: string,
): Promise<Furniture | null> {
  const client = createApiClient(accessToken);
  const data = await client.request<{ furniture: Furniture | null }>(
    FURNITURE_BY_SLUG_QUERY,
    { slug },
  );
  return data.furniture;
}

export async function fetchFurnitureById(
  accessToken: string,
  id: string,
): Promise<Furniture> {
  const client = createApiClient(accessToken);
  const data = await client.request<{ furnitureById: Furniture }>(
    FURNITURE_BY_ID_QUERY,
    { id },
  );
  return data.furnitureById;
}

export async function fetchMyFurniture(
  accessToken: string,
): Promise<Furniture[]> {
  const client = createApiClient(accessToken);
  const data = await client.request<{ myFurniture: Furniture[] }>(
    MY_FURNITURE_QUERY,
  );
  return data.myFurniture;
}

export async function createFurniture(
  accessToken: string,
  input: FurnitureInput,
): Promise<Furniture> {
  const client = createApiClient(accessToken);
  const data = await client.request<{ createFurniture: Furniture }>(
    CREATE_FURNITURE_MUTATION,
    { input },
  );
  return data.createFurniture;
}

export async function updateFurniture(
  accessToken: string,
  input: FurnitureInput & { id: string },
): Promise<Furniture> {
  const client = createApiClient(accessToken);
  const data = await client.request<{ updateFurniture: Furniture }>(
    UPDATE_FURNITURE_MUTATION,
    { input },
  );
  return data.updateFurniture;
}

type StatusMutationField =
  | "publishFurniture"
  | "unpublishFurniture"
  | "reserveFurniture"
  | "markFurnitureSold"
  | "archiveFurniture"
  | "restoreFurniture";

const STATUS_MUTATIONS: Record<StatusMutationField, string> = {
  publishFurniture: gql`
    ${FURNITURE_FIELDS}
    mutation PublishFurniture($id: String!) {
      publishFurniture(id: $id) {
        ...FurnitureFields
      }
    }
  `,
  unpublishFurniture: gql`
    ${FURNITURE_FIELDS}
    mutation UnpublishFurniture($id: String!) {
      unpublishFurniture(id: $id) {
        ...FurnitureFields
      }
    }
  `,
  reserveFurniture: gql`
    ${FURNITURE_FIELDS}
    mutation ReserveFurniture($id: String!) {
      reserveFurniture(id: $id) {
        ...FurnitureFields
      }
    }
  `,
  markFurnitureSold: gql`
    ${FURNITURE_FIELDS}
    mutation MarkFurnitureSold($id: String!) {
      markFurnitureSold(id: $id) {
        ...FurnitureFields
      }
    }
  `,
  archiveFurniture: gql`
    ${FURNITURE_FIELDS}
    mutation ArchiveFurniture($id: String!) {
      archiveFurniture(id: $id) {
        ...FurnitureFields
      }
    }
  `,
  restoreFurniture: gql`
    ${FURNITURE_FIELDS}
    mutation RestoreFurniture($id: String!) {
      restoreFurniture(id: $id) {
        ...FurnitureFields
      }
    }
  `,
};

async function runStatusMutation(
  accessToken: string,
  field: StatusMutationField,
  id: string,
): Promise<Furniture> {
  const client = createApiClient(accessToken);
  const data = await client.request<Record<StatusMutationField, Furniture>>(
    STATUS_MUTATIONS[field],
    { id },
  );
  return data[field];
}

export const publishFurniture = (accessToken: string, id: string) =>
  runStatusMutation(accessToken, "publishFurniture", id);

export const unpublishFurniture = (accessToken: string, id: string) =>
  runStatusMutation(accessToken, "unpublishFurniture", id);

export const reserveFurniture = (accessToken: string, id: string) =>
  runStatusMutation(accessToken, "reserveFurniture", id);

export const markFurnitureSold = (accessToken: string, id: string) =>
  runStatusMutation(accessToken, "markFurnitureSold", id);

export const archiveFurniture = (accessToken: string, id: string) =>
  runStatusMutation(accessToken, "archiveFurniture", id);

export const restoreFurniture = (accessToken: string, id: string) =>
  runStatusMutation(accessToken, "restoreFurniture", id);

export async function duplicateFurniture(
  accessToken: string,
  id: string,
): Promise<Furniture> {
  const client = createApiClient(accessToken);
  const query = gql`
    ${FURNITURE_FIELDS}
    mutation DuplicateFurniture($id: String!) {
      duplicateFurniture(id: $id) {
        ...FurnitureFields
      }
    }
  `;
  const data = await client.request<{ duplicateFurniture: Furniture }>(query, {
    id,
  });
  return data.duplicateFurniture;
}

export async function deleteFurniture(
  accessToken: string,
  id: string,
): Promise<boolean> {
  const client = createApiClient(accessToken);
  const query = gql`
    mutation DeleteFurniture($id: String!) {
      deleteFurniture(id: $id)
    }
  `;
  const data = await client.request<{ deleteFurniture: boolean }>(query, {
    id,
  });
  return data.deleteFurniture;
}

export async function reorderFurnitureImages(
  accessToken: string,
  furnitureId: string,
  imageIds: string[],
): Promise<boolean> {
  const client = createApiClient(accessToken);
  const query = gql`
    mutation ReorderFurnitureImages(
      $furnitureId: String!
      $imageIds: [String!]!
    ) {
      reorderFurnitureImages(furnitureId: $furnitureId, imageIds: $imageIds)
    }
  `;
  const data = await client.request<{ reorderFurnitureImages: boolean }>(
    query,
    {
      furnitureId,
      imageIds,
    },
  );
  return data.reorderFurnitureImages;
}

export async function deleteFurnitureImage(
  accessToken: string,
  id: string,
): Promise<boolean> {
  const client = createApiClient(accessToken);
  const query = gql`
    mutation DeleteFurnitureImage($id: String!) {
      deleteFurnitureImage(id: $id)
    }
  `;
  const data = await client.request<{ deleteFurnitureImage: boolean }>(query, {
    id,
  });
  return data.deleteFurnitureImage;
}

export type { Furniture, FurnitureImage };
