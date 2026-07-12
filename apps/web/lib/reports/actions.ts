"use server";

import { extractErrorMessage } from "@/lib/api/client";
import { fileReport } from "@/lib/api/reports";
import { requireAccessToken } from "@/lib/auth/session";
import type { ReportTargetType } from "@/lib/api/types";
import type { ActionResult } from "@/lib/api/action-result";

export async function fileReportAction(
  targetType: ReportTargetType,
  targetId: string,
  reason: string,
): Promise<ActionResult> {
  try {
    const token = await requireAccessToken();
    await fileReport(token, { targetType, targetId, reason });
    return { success: true };
  } catch (error) {
    return { error: extractErrorMessage(error) };
  }
}
