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
import { restoreUserAction, setUserRoleAction, suspendUserAction } from "@/lib/admin/actions";

export function UserRowActions({
  userId,
  role,
  isSuspended,
}: {
  userId: string;
  role: "USER" | "MODERATOR" | "ADMIN";
  isSuspended: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="flex items-center gap-4">
      <Select
        defaultValue={role}
        disabled={isPending}
        onValueChange={(next) => {
          startTransition(async () => {
            await setUserRoleAction(userId, next as "USER" | "MODERATOR" | "ADMIN");
            router.refresh();
          });
        }}
      >
        <SelectTrigger className="h-8 w-32 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="USER">USER</SelectItem>
          <SelectItem value="MODERATOR">MODERATOR</SelectItem>
          <SelectItem value="ADMIN">ADMIN</SelectItem>
        </SelectContent>
      </Select>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (!isSuspended && !window.confirm("¿Suspender esta cuenta?")) return;
          startTransition(async () => {
            await (isSuspended ? restoreUserAction(userId) : suspendUserAction(userId));
            router.refresh();
          });
        }}
        className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline"
      >
        {isSuspended ? "Restaurar" : "Suspender"}
      </button>
    </div>
  );
}
