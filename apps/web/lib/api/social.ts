import "server-only";
import { gql } from "graphql-request";
import { createApiClient } from "./client";

const FOLLOW_MUTATION = gql`
  mutation FollowUser($userId: String!) {
    followUser(userId: $userId)
  }
`;

const UNFOLLOW_MUTATION = gql`
  mutation UnfollowUser($userId: String!) {
    unfollowUser(userId: $userId)
  }
`;

const BLOCK_MUTATION = gql`
  mutation BlockUser($userId: String!) {
    blockUser(userId: $userId)
  }
`;

const UNBLOCK_MUTATION = gql`
  mutation UnblockUser($userId: String!) {
    unblockUser(userId: $userId)
  }
`;

export async function followUser(
  accessToken: string,
  userId: string,
): Promise<void> {
  const client = createApiClient(accessToken);
  await client.request(FOLLOW_MUTATION, { userId });
}

export async function unfollowUser(
  accessToken: string,
  userId: string,
): Promise<void> {
  const client = createApiClient(accessToken);
  await client.request(UNFOLLOW_MUTATION, { userId });
}

export async function blockUser(
  accessToken: string,
  userId: string,
): Promise<void> {
  const client = createApiClient(accessToken);
  await client.request(BLOCK_MUTATION, { userId });
}

export async function unblockUser(
  accessToken: string,
  userId: string,
): Promise<void> {
  const client = createApiClient(accessToken);
  await client.request(UNBLOCK_MUTATION, { userId });
}
