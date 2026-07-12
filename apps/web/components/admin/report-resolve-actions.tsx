"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { resolveReportAction } from "@/lib/admin/actions";

export function ReportResolveActions({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function resolve(status: "REVIEWED" | "DISMISSED" | "ACTION_TAKEN") {
    startTransition(async () => {
      await resolveReportAction(id, status);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-3">
      <Button size="sm" variant="outline" disabled={isPending} onClick={() => resolve("DISMISSED")}>
        Descartar
      </Button>
      <Button size="sm" variant="outline" disabled={isPending} onClick={() => resolve("REVIEWED")}>
        Marcar revisado
      </Button>
      <Button size="sm" variant="destructive" disabled={isPending} onClick={() => resolve("ACTION_TAKEN")}>
        Tomar acción
      </Button>
    </div>
  );
}
