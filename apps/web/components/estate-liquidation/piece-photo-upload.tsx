"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import {
  deleteEstateLiquidationPieceImageAction,
  uploadEstateLiquidationPieceImageAction,
} from "@/lib/estate-liquidation/actions";
import type { EstateLiquidationPieceImage } from "@/lib/api/types";

export function PiecePhotoUpload({
  pieceId,
  requestId,
  initialImages,
}: {
  pieceId: string;
  requestId: string;
  initialImages: EstateLiquidationPieceImage[];
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
        const result = await uploadEstateLiquidationPieceImageAction(
          pieceId,
          requestId,
          formData,
        );
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
      await deleteEstateLiquidationPieceImageAction(imageId, requestId);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {images.length > 0 ? (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
          {images.map((image) => (
            <div key={image.id} className="relative">
              <div className="bg-muted relative aspect-square w-full overflow-hidden">
                <Image
                  src={image.url}
                  alt={image.altText ?? ""}
                  fill
                  sizes="150px"
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => handleDelete(image.id)}
                className="text-muted-foreground hover:text-foreground mt-1 text-xs underline-offset-4 hover:underline"
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
          className="text-muted-foreground text-xs"
        />
        {error ? <p className="text-destructive mt-1 text-xs">{error}</p> : null}
        {images.length === 0 ? (
          <p className="text-muted-foreground mt-1 text-xs">
            Sin fotografías todavía — agrega al menos una.
          </p>
        ) : null}
      </div>
    </div>
  );
}
