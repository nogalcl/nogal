"use client";

import { useRef, useState, useTransition } from "react";
import { createCollectionAction } from "@/lib/collections/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CreateCollectionForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return;
    setError(null);
    startTransition(async () => {
      const result = await createCollectionAction(name);
      if (result.error) {
        setError(result.error);
      } else {
        formRef.current?.reset();
      }
    });
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="border-border flex items-end gap-3 border-b pb-8"
    >
      <div className="flex-1">
        <label htmlFor="collection-name" className="text-foreground text-sm">
          Nueva colección
        </label>
        <Input
          id="collection-name"
          name="name"
          placeholder="Mi Living"
          maxLength={60}
          required
          className="mt-2"
        />
      </div>
      <Button type="submit" disabled={isPending}>
        Crear
      </Button>
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </form>
  );
}
