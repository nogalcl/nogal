import "server-only";
import { gql } from "graphql-request";
import { createApiClient } from "./client";
import type { Conversation } from "./types";

const CONVERSATION_FIELDS = gql`
  fragment ConversationFields on ConversationEntity {
    id
    status
    lastMessagePreview
    unreadCount
    createdAt
    updatedAt
    furniture {
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
    counterpart {
      id
      username
      firstName
      lastName
      avatarUrl
    }
    messages {
      id
      senderId
      body
      attachmentUrls
      isMine
      delivered
      read
      createdAt
    }
  }
`;

const MY_CONVERSATIONS_QUERY = gql`
  ${CONVERSATION_FIELDS}
  query MyConversations {
    myConversations {
      ...ConversationFields
    }
  }
`;

const CONVERSATION_QUERY = gql`
  ${CONVERSATION_FIELDS}
  query Conversation($id: String!) {
    conversation(id: $id) {
      ...ConversationFields
    }
  }
`;

const START_CONVERSATION_MUTATION = gql`
  mutation StartConversation($furnitureId: String!) {
    startConversation(furnitureId: $furnitureId)
  }
`;

const SEND_MESSAGE_MUTATION = gql`
  mutation SendMessage($conversationId: String!, $body: String!) {
    sendMessage(conversationId: $conversationId, body: $body) {
      id
      senderId
      body
      attachmentUrls
      isMine
      delivered
      read
      createdAt
    }
  }
`;

export async function fetchMyConversations(
  accessToken: string,
): Promise<Conversation[]> {
  const client = createApiClient(accessToken);
  const data = await client.request<{ myConversations: Conversation[] }>(
    MY_CONVERSATIONS_QUERY,
  );
  return data.myConversations;
}

export async function fetchConversation(
  accessToken: string,
  id: string,
): Promise<Conversation> {
  const client = createApiClient(accessToken);
  const data = await client.request<{ conversation: Conversation }>(
    CONVERSATION_QUERY,
    { id },
  );
  return data.conversation;
}

export async function startConversation(
  accessToken: string,
  furnitureId: string,
): Promise<string> {
  const client = createApiClient(accessToken);
  const data = await client.request<{ startConversation: string }>(
    START_CONVERSATION_MUTATION,
    { furnitureId },
  );
  return data.startConversation;
}

export async function sendMessage(
  accessToken: string,
  conversationId: string,
  body: string,
): Promise<void> {
  const client = createApiClient(accessToken);
  await client.request(SEND_MESSAGE_MUTATION, { conversationId, body });
}
