import "server-only";
import { gql } from "graphql-request";
import { createApiClient } from "./client";
import type { FurnitureStatus } from "./types";

// --- Moderación de piezas ---

/** Forma mínima para la cola de moderación — no la ficha completa de Furniture. */
export interface ModerationFurniture {
  id: string;
  title: string;
  slug: string;
  status: FurnitureStatus;
  price: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  category: { name: string };
  store: { name: string; slug: string };
  images: Array<{ url: string; altText: string | null }>;
}

const MODERATION_FURNITURE_FIELDS = gql`
  fragment ModerationFurnitureFields on FurnitureEntity {
    id
    title
    slug
    status
    price
    currency
    createdAt
    updatedAt
    category {
      name
    }
    store {
      name
      slug
    }
    images {
      url
      altText
    }
  }
`;

export async function fetchFurnitureForModeration(
  accessToken: string,
  status?: FurnitureStatus,
): Promise<ModerationFurniture[]> {
  const client = createApiClient(accessToken);
  const data = await client.request<{ furnitureForModeration: ModerationFurniture[] }>(
    gql`
      ${MODERATION_FURNITURE_FIELDS}
      query FurnitureForModeration($status: FurnitureStatus) {
        furnitureForModeration(status: $status) {
          ...ModerationFurnitureFields
        }
      }
    `,
    { status },
  );
  return data.furnitureForModeration;
}

export async function approveFurniture(accessToken: string, id: string): Promise<void> {
  const client = createApiClient(accessToken);
  await client.request(
    gql`
      mutation ApproveFurniture($id: String!) {
        approveFurniture(id: $id) {
          id
        }
      }
    `,
    { id },
  );
}

export async function rejectFurniture(
  accessToken: string,
  id: string,
  reason: string,
): Promise<void> {
  const client = createApiClient(accessToken);
  await client.request(
    gql`
      mutation RejectFurniture($input: RejectFurnitureInput!) {
        rejectFurniture(input: $input) {
          id
        }
      }
    `,
    { input: { id, reason } },
  );
}

// --- Tiendas ---

export interface AdminStore {
  id: string;
  name: string;
  slug: string;
  isVerified: boolean;
  pieceCount: number;
  followersCount: number;
  createdAt: string;
  ownerUsername: string | null;
}

const ADMIN_STORE_FIELDS = gql`
  fragment AdminStoreFields on StoreEntity {
    id
    name
    slug
    isVerified
    pieceCount
    followersCount
    createdAt
    ownerUsername
  }
`;

export async function fetchStoresForAdmin(
  accessToken: string,
  search?: string,
): Promise<AdminStore[]> {
  const client = createApiClient(accessToken);
  const data = await client.request<{ storesForAdmin: AdminStore[] }>(
    gql`
      ${ADMIN_STORE_FIELDS}
      query StoresForAdmin($search: String) {
        storesForAdmin(search: $search) {
          ...AdminStoreFields
        }
      }
    `,
    { search },
  );
  return data.storesForAdmin;
}

export async function verifyStore(accessToken: string, id: string): Promise<void> {
  const client = createApiClient(accessToken);
  await client.request(
    gql`
      mutation VerifyStore($id: String!) {
        verifyStore(id: $id) {
          id
        }
      }
    `,
    { id },
  );
}

export async function unverifyStore(accessToken: string, id: string): Promise<void> {
  const client = createApiClient(accessToken);
  await client.request(
    gql`
      mutation UnverifyStore($id: String!) {
        unverifyStore(id: $id) {
          id
        }
      }
    `,
    { id },
  );
}

// --- Reportes ---

export interface AdminReport {
  id: string;
  reporterId: string;
  targetType: string;
  targetId: string;
  reason: string;
  status: string;
  createdAt: string;
  resolvedAt: string | null;
}

export async function fetchPendingReports(accessToken: string): Promise<AdminReport[]> {
  const client = createApiClient(accessToken);
  const data = await client.request<{ pendingReports: AdminReport[] }>(
    gql`
      query PendingReports {
        pendingReports {
          id
          reporterId
          targetType
          targetId
          reason
          status
          createdAt
          resolvedAt
        }
      }
    `,
  );
  return data.pendingReports;
}

export async function resolveReport(
  accessToken: string,
  id: string,
  status: "REVIEWED" | "DISMISSED" | "ACTION_TAKEN",
): Promise<void> {
  const client = createApiClient(accessToken);
  await client.request(
    gql`
      mutation ResolveReport($id: String!, $status: ReportStatus!) {
        resolveReport(id: $id, status: $status) {
          id
        }
      }
    `,
    { id, status },
  );
}

// --- Usuarios ---

export interface AdminUser {
  id: string;
  email: string;
  emailVerified: boolean;
  role: "USER" | "MODERATOR" | "ADMIN";
  createdAt: string;
  deletedAt: string | null;
  profile: { firstName: string; lastName: string; username: string } | null;
}

export async function fetchAdminUsers(
  accessToken: string,
  search?: string,
): Promise<AdminUser[]> {
  const client = createApiClient(accessToken);
  const data = await client.request<{ adminUsers: AdminUser[] }>(
    gql`
      query AdminUsers($search: String) {
        adminUsers(search: $search) {
          id
          email
          emailVerified
          role
          createdAt
          deletedAt
          profile {
            firstName
            lastName
            username
          }
        }
      }
    `,
    { search },
  );
  return data.adminUsers;
}

export async function setUserRole(
  accessToken: string,
  userId: string,
  role: "USER" | "MODERATOR" | "ADMIN",
): Promise<void> {
  const client = createApiClient(accessToken);
  await client.request(
    gql`
      mutation SetUserRole($userId: String!, $role: RoleName!) {
        setUserRole(userId: $userId, role: $role) {
          id
        }
      }
    `,
    { userId, role },
  );
}

export async function suspendUser(accessToken: string, userId: string): Promise<void> {
  const client = createApiClient(accessToken);
  await client.request(
    gql`
      mutation SuspendUser($userId: String!) {
        suspendUser(userId: $userId) {
          id
        }
      }
    `,
    { userId },
  );
}

export async function restoreUser(accessToken: string, userId: string): Promise<void> {
  const client = createApiClient(accessToken);
  await client.request(
    gql`
      mutation RestoreUser($userId: String!) {
        restoreUser(userId: $userId) {
          id
        }
      }
    `,
    { userId },
  );
}

// --- Roles / permisos ---

export interface AdminRole {
  name: string;
  description: string | null;
  permissions: string[];
}

export async function fetchRoles(accessToken: string): Promise<AdminRole[]> {
  const client = createApiClient(accessToken);
  const data = await client.request<{ roles: AdminRole[] }>(
    gql`
      query Roles {
        roles {
          name
          description
          permissions
        }
      }
    `,
  );
  return data.roles;
}

// --- Logs ---

export interface AdminAuditLog {
  id: string;
  actorName: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  createdAt: string;
}

export async function fetchAuditLogs(
  accessToken: string,
  targetType?: string,
): Promise<AdminAuditLog[]> {
  const client = createApiClient(accessToken);
  const data = await client.request<{ auditLogs: AdminAuditLog[] }>(
    gql`
      query AuditLogs($targetType: String) {
        auditLogs(targetType: $targetType) {
          id
          actorName
          action
          targetType
          targetId
          createdAt
        }
      }
    `,
    { targetType },
  );
  return data.auditLogs;
}
