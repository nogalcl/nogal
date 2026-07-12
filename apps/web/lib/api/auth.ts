import "server-only";
import { gql } from "graphql-request";
import { createApiClient } from "./client";

export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  role: "USER" | "MODERATOR" | "ADMIN";
  createdAt: string;
  /** Solo relevante en el panel admin — siempre null fuera de ese contexto. */
  deletedAt?: string | null;
  profile: {
    firstName: string;
    lastName: string;
    username: string;
    avatarUrl: string | null;
    bio: string | null;
    reputation: number;
    favoritesCount: number;
    followersCount: number;
    followingCount: number;
  } | null;
}

export interface AuthPayload {
  accessToken: string;
  accessTokenExpiresInSeconds: number;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  user: AuthUser;
}

const AUTH_PAYLOAD_FIELDS = gql`
  fragment AuthPayloadFields on AuthPayload {
    accessToken
    accessTokenExpiresInSeconds
    refreshToken
    refreshTokenExpiresAt
    user {
      id
      email
      emailVerified
      role
      createdAt
      profile {
        firstName
        lastName
        username
        avatarUrl
        bio
        reputation
        favoritesCount
        followersCount
        followingCount
      }
    }
  }
`;

const REGISTER_MUTATION = gql`
  ${AUTH_PAYLOAD_FIELDS}
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      ...AuthPayloadFields
    }
  }
`;

const LOGIN_MUTATION = gql`
  ${AUTH_PAYLOAD_FIELDS}
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      ...AuthPayloadFields
    }
  }
`;

const LOGOUT_MUTATION = gql`
  mutation Logout($input: LogoutInput!) {
    logout(input: $input)
  }
`;

const VERIFY_EMAIL_MUTATION = gql`
  mutation VerifyEmail($input: VerifyEmailInput!) {
    verifyEmail(input: $input)
  }
`;

const REQUEST_PASSWORD_RESET_MUTATION = gql`
  mutation RequestPasswordReset($input: RequestPasswordResetInput!) {
    requestPasswordReset(input: $input)
  }
`;

const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input)
  }
`;

const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      emailVerified
      role
      createdAt
      profile {
        firstName
        lastName
        username
        avatarUrl
        bio
        reputation
        favoritesCount
        followersCount
        followingCount
      }
    }
  }
`;

export async function registerUser(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
}): Promise<AuthPayload> {
  const client = createApiClient();
  const data = await client.request<{ register: AuthPayload }>(
    REGISTER_MUTATION,
    { input },
  );
  return data.register;
}

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<AuthPayload> {
  const client = createApiClient();
  const data = await client.request<{ login: AuthPayload }>(LOGIN_MUTATION, {
    input,
  });
  return data.login;
}

export async function logoutUser(refreshToken: string): Promise<void> {
  const client = createApiClient();
  await client.request(LOGOUT_MUTATION, { input: { refreshToken } });
}

export async function verifyEmail(token: string): Promise<void> {
  const client = createApiClient();
  await client.request(VERIFY_EMAIL_MUTATION, { input: { token } });
}

export async function requestPasswordReset(email: string): Promise<void> {
  const client = createApiClient();
  await client.request(REQUEST_PASSWORD_RESET_MUTATION, { input: { email } });
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<void> {
  const client = createApiClient();
  await client.request(RESET_PASSWORD_MUTATION, {
    input: { token, newPassword },
  });
}

export async function fetchCurrentUser(
  accessToken: string,
): Promise<AuthUser | null> {
  const client = createApiClient(accessToken);
  const data = await client.request<{ me: AuthUser | null }>(ME_QUERY);
  return data.me;
}
