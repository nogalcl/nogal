import "server-only";
import { gql } from "graphql-request";
import { createApiClient } from "./client";
import type { ReportTargetType } from "./types";

const FILE_REPORT_MUTATION = gql`
  mutation FileReport($input: CreateReportInput!) {
    fileReport(input: $input) {
      id
      status
    }
  }
`;

export async function fileReport(
  accessToken: string,
  input: { targetType: ReportTargetType; targetId: string; reason: string },
): Promise<void> {
  const client = createApiClient(accessToken);
  await client.request(FILE_REPORT_MUTATION, { input });
}
