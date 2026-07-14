import "server-only";
import { gql } from "graphql-request";
import { createApiClient } from "./client";
import type {
  ConversationParticipant,
  EstateLiquidationRequest,
  EstateLiquidationRequestStatus,
} from "./types";

const ESTATE_LIQUIDATION_REQUEST_FIELDS = gql`
  fragment EstateLiquidationRequestFields on EstateLiquidationRequestEntity {
    id
    contactName
    contactPhone
    addressLine
    addressCity
    addressRegion
    visitNotes
    unitFee
    totalFee
    currency
    paidAt
    status
    createdAt
    updatedAt
    requester {
      id
      username
      firstName
      lastName
      avatarUrl
    }
    assignedExpert {
      id
      username
      firstName
      lastName
      avatarUrl
    }
    comments {
      id
      body
      createdAt
      author {
        id
        username
        firstName
        lastName
        avatarUrl
      }
    }
    history {
      id
      description
      actorName
      createdAt
    }
    pieces {
      id
      requestId
      title
      description
      outcome
      condition
      expertNotes
      estimatedValueMin
      estimatedValueMax
      classifiedAt
      order
      category {
        id
        name
        slug
      }
      images {
        id
        url
        altText
        order
        width
        height
      }
      recommendedRestorer {
        id
        name
        specialty
        phone
        email
        city
      }
      classifiedBy {
        id
        username
        firstName
        lastName
        avatarUrl
      }
    }
  }
`;

export async function fetchMyEstateLiquidationRequests(
  accessToken: string,
): Promise<EstateLiquidationRequest[]> {
  const client = createApiClient(accessToken);
  const data = await client.request<{
    myEstateLiquidationRequests: EstateLiquidationRequest[];
  }>(
    gql`
      ${ESTATE_LIQUIDATION_REQUEST_FIELDS}
      query MyEstateLiquidationRequests {
        myEstateLiquidationRequests {
          ...EstateLiquidationRequestFields
        }
      }
    `,
  );
  return data.myEstateLiquidationRequests;
}

export async function fetchEstateLiquidationRequest(
  accessToken: string,
  id: string,
): Promise<EstateLiquidationRequest> {
  const client = createApiClient(accessToken);
  const data = await client.request<{
    estateLiquidationRequest: EstateLiquidationRequest;
  }>(
    gql`
      ${ESTATE_LIQUIDATION_REQUEST_FIELDS}
      query EstateLiquidationRequest($id: String!) {
        estateLiquidationRequest(id: $id) {
          ...EstateLiquidationRequestFields
        }
      }
    `,
    { id },
  );
  return data.estateLiquidationRequest;
}

export async function fetchEstateLiquidationRequestsForStaff(
  accessToken: string,
  filter: { status?: EstateLiquidationRequestStatus; assignedToMe?: boolean } = {},
): Promise<EstateLiquidationRequest[]> {
  const client = createApiClient(accessToken);
  const data = await client.request<{
    estateLiquidationRequestsForStaff: EstateLiquidationRequest[];
  }>(
    gql`
      ${ESTATE_LIQUIDATION_REQUEST_FIELDS}
      query EstateLiquidationRequestsForStaff(
        $status: EstateLiquidationRequestStatus
        $assignedToMe: Boolean
      ) {
        estateLiquidationRequestsForStaff(
          status: $status
          assignedToMe: $assignedToMe
        ) {
          ...EstateLiquidationRequestFields
        }
      }
    `,
    filter,
  );
  return data.estateLiquidationRequestsForStaff;
}

export async function startEstateLiquidationRequest(
  accessToken: string,
): Promise<EstateLiquidationRequest> {
  const client = createApiClient(accessToken);
  const data = await client.request<{
    startEstateLiquidationRequest: EstateLiquidationRequest;
  }>(
    gql`
      ${ESTATE_LIQUIDATION_REQUEST_FIELDS}
      mutation StartEstateLiquidationRequest {
        startEstateLiquidationRequest {
          ...EstateLiquidationRequestFields
        }
      }
    `,
  );
  return data.startEstateLiquidationRequest;
}

export async function fetchEstateLiquidationExperts(
  accessToken: string,
): Promise<ConversationParticipant[]> {
  const client = createApiClient(accessToken);
  const data = await client.request<{
    estateLiquidationExperts: ConversationParticipant[];
  }>(
    gql`
      query EstateLiquidationExperts {
        estateLiquidationExperts {
          id
          username
          firstName
          lastName
          avatarUrl
        }
      }
    `,
  );
  return data.estateLiquidationExperts;
}

export interface UpdateEstateLiquidationRequestInput {
  id: string;
  contactName?: string;
  contactPhone?: string;
  addressLine?: string;
  addressCity?: string;
  addressRegion?: string;
  visitNotes?: string;
}

export async function updateEstateLiquidationRequest(
  accessToken: string,
  input: UpdateEstateLiquidationRequestInput,
): Promise<EstateLiquidationRequest> {
  const client = createApiClient(accessToken);
  const data = await client.request<{
    updateEstateLiquidationRequest: EstateLiquidationRequest;
  }>(
    gql`
      ${ESTATE_LIQUIDATION_REQUEST_FIELDS}
      mutation UpdateEstateLiquidationRequest(
        $input: UpdateEstateLiquidationRequestInput!
      ) {
        updateEstateLiquidationRequest(input: $input) {
          ...EstateLiquidationRequestFields
        }
      }
    `,
    { input },
  );
  return data.updateEstateLiquidationRequest;
}

export interface EstateLiquidationPieceInput {
  requestId: string;
  title: string;
  description?: string;
  categoryId?: string;
}

export async function addEstateLiquidationPiece(
  accessToken: string,
  input: EstateLiquidationPieceInput,
): Promise<EstateLiquidationRequest> {
  const client = createApiClient(accessToken);
  const data = await client.request<{
    addEstateLiquidationPiece: EstateLiquidationRequest;
  }>(
    gql`
      ${ESTATE_LIQUIDATION_REQUEST_FIELDS}
      mutation AddEstateLiquidationPiece(
        $input: CreateEstateLiquidationPieceInput!
      ) {
        addEstateLiquidationPiece(input: $input) {
          ...EstateLiquidationRequestFields
        }
      }
    `,
    { input },
  );
  return data.addEstateLiquidationPiece;
}

export async function updateEstateLiquidationPiece(
  accessToken: string,
  input: { id: string; title?: string; description?: string; categoryId?: string },
): Promise<EstateLiquidationRequest> {
  const client = createApiClient(accessToken);
  const data = await client.request<{
    updateEstateLiquidationPiece: EstateLiquidationRequest;
  }>(
    gql`
      ${ESTATE_LIQUIDATION_REQUEST_FIELDS}
      mutation UpdateEstateLiquidationPiece(
        $input: UpdateEstateLiquidationPieceInput!
      ) {
        updateEstateLiquidationPiece(input: $input) {
          ...EstateLiquidationRequestFields
        }
      }
    `,
    { input },
  );
  return data.updateEstateLiquidationPiece;
}

export async function removeEstateLiquidationPiece(
  accessToken: string,
  pieceId: string,
): Promise<EstateLiquidationRequest> {
  const client = createApiClient(accessToken);
  const data = await client.request<{
    removeEstateLiquidationPiece: EstateLiquidationRequest;
  }>(
    gql`
      ${ESTATE_LIQUIDATION_REQUEST_FIELDS}
      mutation RemoveEstateLiquidationPiece($pieceId: String!) {
        removeEstateLiquidationPiece(pieceId: $pieceId) {
          ...EstateLiquidationRequestFields
        }
      }
    `,
    { pieceId },
  );
  return data.removeEstateLiquidationPiece;
}

export async function simulateEstateLiquidationPayment(
  accessToken: string,
  id: string,
): Promise<EstateLiquidationRequest> {
  const client = createApiClient(accessToken);
  const data = await client.request<{
    simulateEstateLiquidationPayment: EstateLiquidationRequest;
  }>(
    gql`
      ${ESTATE_LIQUIDATION_REQUEST_FIELDS}
      mutation SimulateEstateLiquidationPayment($id: String!) {
        simulateEstateLiquidationPayment(id: $id) {
          ...EstateLiquidationRequestFields
        }
      }
    `,
    { id },
  );
  return data.simulateEstateLiquidationPayment;
}

export async function cancelEstateLiquidationRequest(
  accessToken: string,
  id: string,
): Promise<void> {
  const client = createApiClient(accessToken);
  await client.request(
    gql`
      mutation CancelEstateLiquidationRequest($id: String!) {
        cancelEstateLiquidationRequest(id: $id) {
          id
        }
      }
    `,
    { id },
  );
}

export async function deleteEstateLiquidationPieceImage(
  accessToken: string,
  id: string,
): Promise<void> {
  const client = createApiClient(accessToken);
  await client.request(
    gql`
      mutation DeleteEstateLiquidationPieceImage($id: String!) {
        deleteEstateLiquidationPieceImage(id: $id)
      }
    `,
    { id },
  );
}

export async function assignEstateLiquidationExpert(
  accessToken: string,
  requestId: string,
  expertId: string,
): Promise<void> {
  const client = createApiClient(accessToken);
  await client.request(
    gql`
      mutation AssignEstateLiquidationExpert(
        $requestId: String!
        $expertId: String!
      ) {
        assignEstateLiquidationExpert(requestId: $requestId, expertId: $expertId) {
          id
        }
      }
    `,
    { requestId, expertId },
  );
}

export async function setEstateLiquidationRequestStatus(
  accessToken: string,
  requestId: string,
  status: EstateLiquidationRequestStatus,
): Promise<void> {
  const client = createApiClient(accessToken);
  await client.request(
    gql`
      mutation SetEstateLiquidationRequestStatus(
        $requestId: String!
        $status: EstateLiquidationRequestStatus!
      ) {
        setEstateLiquidationRequestStatus(requestId: $requestId, status: $status) {
          id
        }
      }
    `,
    { requestId, status },
  );
}

export async function addEstateLiquidationComment(
  accessToken: string,
  requestId: string,
  body: string,
): Promise<void> {
  const client = createApiClient(accessToken);
  await client.request(
    gql`
      mutation AddEstateLiquidationComment($requestId: String!, $body: String!) {
        addEstateLiquidationComment(requestId: $requestId, body: $body) {
          id
        }
      }
    `,
    { requestId, body },
  );
}

export interface ClassifyPieceInput {
  pieceId: string;
  outcome: string;
  condition?: string;
  expertNotes?: string;
  estimatedValueMin?: number;
  estimatedValueMax?: number;
  recommendedRestorerId?: string;
}

export async function classifyEstateLiquidationPiece(
  accessToken: string,
  input: ClassifyPieceInput,
): Promise<void> {
  const client = createApiClient(accessToken);
  await client.request(
    gql`
      mutation ClassifyEstateLiquidationPiece($input: ClassifyPieceInput!) {
        classifyEstateLiquidationPiece(input: $input) {
          id
        }
      }
    `,
    { input },
  );
}

export async function completeEstateLiquidationReview(
  accessToken: string,
  requestId: string,
): Promise<void> {
  const client = createApiClient(accessToken);
  await client.request(
    gql`
      mutation CompleteEstateLiquidationReview($requestId: String!) {
        completeEstateLiquidationReview(requestId: $requestId) {
          id
        }
      }
    `,
    { requestId },
  );
}
