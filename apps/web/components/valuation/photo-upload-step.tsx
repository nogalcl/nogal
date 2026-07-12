"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  deleteValuationRequestImageAction,
  uploadValuationImageAction,
} from "@/lib/valuation/actions";
import type { ValuationRequestImage } from "@/lib/api/types";

export function PhotoUploadStep({
  requestId,
  initialImages,
}: {
  requestId: string;
  initialImages: ValuationRequestImage[];
}) {
  const [images, setImages] = useState(initialImages);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    startTransition(async () => {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const result = await uploadValuationImageAction(requestId, formData);
        if (result.error) {
          setError(result.error);
        } else if (result.image) {
          setImages((prev) => [...prev, result.image!]);
        }
      }
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  function handleDelete(imageId: string) {
    setImages((prev) => prev.filter((img) => img.id !== imageId));
    startTransition(async () => {
      await deleteValuationRequestImageAction(imageId, requestId);
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-foreground font-serif text-2xl">Fotografías</h2>
        <p className="text-muted-foreground mt-2 max-w-lg text-sm">
          Sube varias fotografías: el conjunto completo, detalles, marcas o
          etiquetas del fabricante y cualquier daño visible.
        </p>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
          {images.map((image) => (
            <div key={image.id} className="relative">
              <div className="bg-muted relative aspect-square w-full overflow-hidden">
                <Image
                  src={image.url}
                  alt={image.altText ?? ""}
                  fill
                  sizes="200px"
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => handleDelete(image.id)}
                className="text-muted-foreground hover:text-foreground mt-2 text-xs underline-offset-4 hover:underline"
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          multiple
          onChange={(event) => handleFiles(event.target.files)}
          disabled={isPending}
          className="text-foreground text-sm"
        />
        {error ? <p className="text-destructive mt-2 text-sm">{error}</p> : null}
      </div>

      <div>
        <Button asChild disabled={images.length === 0}>
          <Link
            href={
              images.length === 0
                ? "#"
                : `/valoracion-express/${requestId}?paso=2`
            }
            aria-disabled={images.length === 0}
          >
            Siguiente
          </Link>
        </Button>
        {images.length === 0 ? (
          <p className="text-muted-foreground mt-2 text-sm">
            Agrega al menos una fotografía para continuar.
          </p>
        ) : null}
      </div>
    </div>
  );
}
