import "server-only";
import { gql } from "graphql-request";
import { createApiClient } from "./client";
import type {
  ConversationParticipant,
  ValuationRequest,
  ValuationRequestStatus,
} from "./types";

const VALUATION_REQUEST_FIELDS = gql`
  fragment ValuationRequestFields on ValuationRequestEntity {
    id
    title
    description
    estimatedDecade
    locationCity
    objective
    serviceFee
    currency
    paidAt
    status
    createdAt
    updatedAt
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
    report {
      id
      requestId
      summary
      probableIdentification
      decade
      condition
      observations
      warnings
      estimatedValueMin
      estimatedValueMax
      quickSaleValue
      idealSaleValue
      currency
      estimatedSaleTime
      tips
      confidenceLevel
      pdfUrl
      providedAt
      updatedAt
      expert {
        id
        username
        firstName
        lastName
        avatarUrl
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
    }
  }
`;

export async function fetchMyValuationRequests(
  accessToken: string,
): Promise<ValuationRequest[]> {
  const client = createApiClient(accessToken);
  const data = await client.request<{ myValuationRequests: ValuationRequest[] }>(
    gql`
      ${VALUATION_REQUEST_FIELDS}
      query MyValuationRequests {
        myValuationRequests {
          ...ValuationRequestFields
        }
      }
    `,
  );
  return data.myValuationRequests;
}

export async function fetchValuationRequest(
  accessToken: string,
  id: string,
): Promise<ValuationRequest> {
  const client = createApiClient(accessToken);
  const data = await client.request<{ valuationRequest: ValuationRequest }>(
    gql`
      ${VALUATION_REQUEST_FIELDS}
      query ValuationRequest($id: String!) {
        valuationRequest(id: $id) {
          ...ValuationRequestFields
        }
      }
    `,
    { id },
  );
  return data.valuationRequest;
}

export async function fetchValuationRequestsForStaff(
  accessToken: string,
  filter: { status?: ValuationRequestStatus; assignedToMe?: boolean } = {},
): Promise<ValuationRequest[]> {
  const client = createApiClient(accessToken);
  const data = await client.request<{
    valuationRequestsForStaff: ValuationRequest[];
  }>(
    gql`
      ${VALUATION_REQUEST_FIELDS}
      query ValuationRequestsForStaff($status: ValuationRequestStatus, $assignedToMe: Boolean) {
        valuationRequestsForStaff(status: $status, assignedToMe: $assignedToMe) {
          ...ValuationRequestFields
        }
      }
    `,
    filter,
  );
  return data.valuationRequestsForStaff;
}

export async function startValuationRequest(
  accessToken: string,
): Promise<ValuationRequest> {
  const client = createApiClient(accessToken);
  const data = await client.request<{ startValuationRequest: ValuationRequest }>(
    gql`
      ${VALUATION_REQUEST_FIELDS}
      mutation StartValuationRequest {
        startValuationRequest {
          ...ValuationRequestFields
        }
      }
    `,
  );
  return data.startValuationRequest;
}

export async function fetchValuationExperts(
  accessToken: string,
): Promise<ConversationParticipant[]> {
  const client = createApiClient(accessToken);
  const data = await client.request<{
    valuationExperts: ConversationParticipant[];
  }>(
    gql`
      query ValuationExperts {
        valuationExperts {
          id
          username
          firstName
          lastName
          avatarUrl
        }
      }
    `,
  );
  return data.valuationExperts;
}

export interface UpdateValuationRequestInput {
  id: string;
  title?: string;
  description?: string;
  categoryId?: string;
  estimatedDecade?: number;
  locationCity?: string;
  objective?: string;
}

export async function updateValuationRequest(
  accessToken: string,
  input: UpdateValuationRequestInput,
): Promise<ValuationRequest> {
  const client = createApiClient(accessToken);
  const data = await client.request<{ updateValuationRequest: ValuationRequest }>(
    gql`
      ${VALUATION_REQUEST_FIELDS}
      mutation UpdateValuationRequest($input: UpdateValuationRequestInput!) {
        updateValuationRequest(input: $input) {
          ...ValuationRequestFields
        }
      }
    `,
    { input },
  );
  return data.updateValuationRequest;
}

export async function simulateValuationPayment(
  accessToken: string,
  id: string,
): Promise<ValuationRequest> {
  const client = createApiClient(accessToken);
  const data = await client.request<{
    simulateValuationPayment: ValuationRequest;
  }>(
    gql`
      ${VALUATION_REQUEST_FIELDS}
      mutation SimulateValuationPayment($id: String!) {
        simulateValuationPayment(id: $id) {
          ...ValuationRequestFields
        }
      }
    `,
    { id },
  );
  return data.simulateValuationPayment;
}

export async function cancelValuationRequest(
  accessToken: string,
  id: string,
): Promise<void> {
  const client = createApiClient(accessToken);
  await client.request(
    gql`
      mutation CancelValuationRequest($id: String!) {
        cancelValuationRequest(id: $id) {
          id
        }
      }
    `,
    { id },
  );
}

export async function deleteValuationRequestImage(
  accessToken: string,
  id: string,
): Promise<void> {
  const client = createApiClient(accessToken);
  await client.request(
    gql`
      mutation DeleteValuationRequestImage($id: String!) {
        deleteValuationRequestImage(id: $id)
      }
    `,
    { id },
  );
}

export async function assignValuationExpert(
  accessToken: string,
  requestId: string,
  expertId: string,
): Promise<void> {
  const client = createApiClient(accessToken);
  await client.request(
    gql`
      mutation AssignValuationExpert($requestId: String!, $expertId: String!) {
        assignValuationExpert(requestId: $requestId, expertId: $expertId) {
          id
        }
      }
    `,
    { requestId, expertId },
  );
}

export async function setValuationRequestStatus(
  accessToken: string,
  requestId: string,
  status: ValuationRequestStatus,
): Promise<void> {
  const client = createApiClient(accessToken);
  await client.request(
    gql`
      mutation SetValuationRequestStatus(
        $requestId: String!
        $status: ValuationRequestStatus!
      ) {
        setValuationRequestStatus(requestId: $requestId, status: $status) {
          id
        }
      }
    `,
    { requestId, status },
  );
}

export async function addValuationComment(
  accessToken: string,
  requestId: string,
  body: string,
): Promise<void> {
  const client = createApiClient(accessToken);
  await client.request(
    gql`
      mutation AddValuationComment($requestId: String!, $body: String!) {
        addValuationComment(requestId: $requestId, body: $body) {
          id
        }
      }
    `,
    { requestId, body },
  );
}

export interface ValuationReportInput {
  requestId: string;
  summary: string;
  probableIdentification?: string;
  materialIds?: string[];
  woodTypeIds?: string[];
  styleId?: string;
  decade?: number;
  designerId?: string;
  manufacturerId?: string;
  condition?: string;
  observations?: string;
  warnings?: string;
  estimatedValueMin: number;
  estimatedValueMax: number;
  quickSaleValue?: number;
  idealSaleValue?: number;
  estimatedSaleTime?: string;
  tips?: string;
  confidenceLevel?: number;
}

export async function createValuationReport(
  accessToken: string,
  input: ValuationReportInput,
): Promise<void> {
  const client = createApiClient(accessToken);
  await client.request(
    gql`
      mutation CreateValuationReport($input: ValuationReportInput!) {
        createValuationReport(input: $input) {
          id
        }
      }
    `,
    { input },
  );
}

export async function updateValuationReport(
  accessToken: string,
  input: ValuationReportInput,
): Promise<void> {
  const client = createApiClient(accessToken);
  await client.request(
    gql`
      mutation UpdateValuationReport($input: ValuationReportInput!) {
        updateValuationReport(input: $input) {
          id
        }
      }
    `,
    { input },
  );
}
