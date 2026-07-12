import "server-only";
import { gql } from "graphql-request";
import { createApiClient } from "./client";
import type { NotificationConnection } from "./types";

const MY_NOTIFICATIONS_QUERY = gql`
  query MyNotifications($page: Int) {
    myNotifications(page: $page) {
      total
      unreadCount
      page
      totalPages
      items {
        id
        type
        message
        link
        read
        createdAt
      }
    }
  }
`;

const MARK_NOTIFICATION_READ_MUTATION = gql`
  mutation MarkNotificationRead($id: String!) {
    markNotificationRead(id: $id)
  }
`;

const MARK_ALL_NOTIFICATIONS_READ_MUTATION = gql`
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead
  }
`;

export async function fetchMyNotifications(
  accessToken: string,
  page = 1,
): Promise<NotificationConnection> {
  const client = createApiClient(accessToken);
  const data = await client.request<{
    myNotifications: NotificationConnection;
  }>(MY_NOTIFICATIONS_QUERY, { page });
  return data.myNotifications;
}

export async function markNotificationRead(
  accessToken: string,
  id: string,
): Promise<void> {
  const client = createApiClient(accessToken);
  await client.request(MARK_NOTIFICATION_READ_MUTATION, { id });
}

export async function markAllNotificationsRead(
  accessToken: string,
): Promise<void> {
  const client = createApiClient(accessToken);
  await client.request(MARK_ALL_NOTIFICATIONS_READ_MUTATION);
}
