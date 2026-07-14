"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { assignEstateLiquidationExpertAction } from "@/lib/estate-liquidation/actions";
import type { ConversationParticipant } from "@/lib/api/types";

export function AssignExpertForm({
  requestId,
  experts,
  currentExpertId,
}: {
  requestId: string;
  experts: ConversationParticipant[];
  currentExpertId?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Select
      defaultValue={currentExpertId}
      disabled={isPending}
      onValueChange={(expertId) => {
        startTransition(async () => {
          await assignEstateLiquidationExpertAction(requestId, expertId);
          router.refresh();
        });
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder="Sin asignar" />
      </SelectTrigger>
      <SelectContent>
        {experts.map((expert) => (
          <SelectItem key={expert.id} value={expert.id}>
            {expert.firstName} {expert.lastName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
