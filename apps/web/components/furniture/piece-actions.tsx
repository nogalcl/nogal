"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  archiveFurnitureAction,
  deleteFurnitureAction,
  duplicateFurnitureAction,
  markFurnitureSoldAction,
  publishFurnitureAction,
  reserveFurnitureAction,
  restoreFurnitureAction,
  unpublishFurnitureAction,
  type ActionResult,
} from "@/lib/furniture/actions";
import type { FurnitureStatus } from "@/lib/api/types";

interface PieceActionsProps {
  id: string;
  status: FurnitureStatus;
}

const ACTIONS_BY_STATUS: Record<
  FurnitureStatus,
  Array<{
    label: string;
    run: (id: string) => Promise<ActionResult>;
    confirm?: string;
  }>
> = {
  DRAFT: [
    { label: "Publicar", run: publishFurnitureAction },
    { label: "Archivar", run: archiveFurnitureAction },
  ],
  UNDER_REVIEW: [{ label: "Archivar", run: archiveFurnitureAction }],
  PUBLISHED: [
    { label: "Despublicar", run: unpublishFurnitureAction },
    { label: "Marcar reservada", run: reserveFurnitureAction },
    { label: "Marcar vendida", run: markFurnitureSoldAction },
    { label: "Archivar", run: archiveFurnitureAction },
  ],
  RESERVED: [
    { label: "Despublicar", run: unpublishFurnitureAction },
    { label: "Marcar vendida", run: markFurnitureSoldAction },
    { label: "Archivar", run: archiveFurnitureAction },
  ],
  SOLD: [{ label: "Archivar", run: archiveFurnitureAction }],
  ARCHIVED: [{ label: "Restaurar a borrador", run: restoreFurnitureAction }],
  REJECTED: [{ label: "Archivar", run: archiveFurnitureAction }],
};

export function PieceActions({ id, status }: PieceActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(action: (id: string) => Promise<ActionResult>) {
    setError(null);
    startTransition(async () => {
      const result = await action(id);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  function runDuplicate() {
    setError(null);
    startTransition(async () => {
      const result = await duplicateFurnitureAction(id);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  function runDelete() {
    if (
      !window.confirm("¿Eliminar esta pieza? Esta acción no se puede deshacer.")
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await deleteFurnitureAction(id);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  const contextualActions = ACTIONS_BY_STATUS[status] ?? [];

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap justify-end gap-2">
        {contextualActions.map((action) => (
          <Button
            key={action.label}
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => run(action.run)}
          >
            {action.label}
          </Button>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={runDuplicate}
        >
          Duplicar
        </Button>
        {status !== "SOLD" ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={runDelete}
          >
            Eliminar
          </Button>
        ) : null}
      </div>
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </div>
  );
}
