"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  addToCollectionAction,
  createCollectionAction,
  removeFromCollectionAction,
} from "@/lib/collections/actions";
import type { CollectionSummary } from "@/lib/api/types";

export function AddToCollectionMenu({
  furnitureId,
  collections,
}: {
  furnitureId: string;
  collections: CollectionSummary[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [memberOf, setMemberOf] = useState(
    () =>
      new Set(
        collections
          .filter((c) => c.items.some((item) => item.id === furnitureId))
          .map((c) => c.id),
      ),
  );
  const formRef = useRef<HTMLFormElement>(null);

  function toggle(collectionId: string) {
    const isMember = memberOf.has(collectionId);
    setMemberOf((prev) => {
      const next = new Set(prev);
      if (isMember) {
        next.delete(collectionId);
      } else {
        next.add(collectionId);
      }
      return next;
    });
    startTransition(async () => {
      if (isMember) {
        await removeFromCollectionAction(collectionId, furnitureId);
      } else {
        await addToCollectionAction(collectionId, furnitureId);
      }
    });
  }

  function handleCreate(formData: FormData) {
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return;
    startTransition(async () => {
      await createCollectionAction(name);
      formRef.current?.reset();
      router.refresh();
    });
  }

  return (
    <div className="border-border border-t pt-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-foreground text-sm underline-offset-4 hover:underline"
        aria-expanded={open}
      >
        {open ? "Cerrar colecciones" : "Añadir a una colección"}
      </button>

      {open ? (
        <div className="mt-4 flex flex-col gap-2">
          {collections.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Todavía no tienes colecciones.
            </p>
          ) : (
            collections.map((collection) => (
              <label
                key={collection.id}
                className="flex items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={memberOf.has(collection.id)}
                  disabled={isPending}
                  onChange={() => toggle(collection.id)}
                  className="border-border size-4"
                />
                <span className="text-foreground">{collection.name}</span>
              </label>
            ))
          )}

          <form
            ref={formRef}
            action={handleCreate}
            className="mt-2 flex items-center gap-2"
          >
            <Input
              name="name"
              placeholder="Nueva colección"
              maxLength={60}
              className="h-8 text-sm"
            />
            <Button type="submit" size="sm" variant="outline" disabled={isPending}>
              Crear
            </Button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
