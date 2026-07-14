"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addEstateLiquidationCommentAction } from "@/lib/estate-liquidation/actions";
import type { EstateLiquidationComment } from "@/lib/api/types";

function formatTimestamp(date: string): string {
  return new Date(date).toLocaleString("es-CL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function InternalComments({
  requestId,
  comments,
}: {
  requestId: string;
  comments: EstateLiquidationComment[];
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    const body = String(formData.get("body") ?? "").trim();
    if (!body) return;
    startTransition(async () => {
      await addEstateLiquidationCommentAction(requestId, body);
      formRef.current?.reset();
      router.refresh();
    });
  }

  return (
    <div>
      <p className="text-foreground text-sm">
        Comentarios internos
        <span className="text-muted-foreground ml-2 text-xs">
          Solo visibles para el equipo
        </span>
      </p>

      <div className="mt-4 flex flex-col gap-4">
        {comments.map((comment) => (
          <div key={comment.id} className="border-border border-l-2 pl-4">
            <p className="text-muted-foreground text-xs">
              {comment.author.firstName} {comment.author.lastName} ·{" "}
              {formatTimestamp(comment.createdAt)}
            </p>
            <p className="text-foreground mt-1 text-sm">{comment.body}</p>
          </div>
        ))}
      </div>

      <form ref={formRef} action={handleSubmit} className="mt-4 flex flex-col gap-2">
        <Textarea name="body" rows={2} placeholder="Agregar un comentario interno…" />
        <div>
          <Button type="submit" size="sm" variant="outline" disabled={isPending}>
            Comentar
          </Button>
        </div>
      </form>
    </div>
  );
}
