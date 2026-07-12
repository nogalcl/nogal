"use client";

import Image from "next/image";
import { GripVertical, X } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import type { FurnitureImage } from "@/lib/api/types";

interface SortableImageProps {
  image: FurnitureImage;
  isPrimary: boolean;
  onDelete: () => void;
}

export function SortableImage({
  image,
  isPrimary,
  onDelete,
}: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "border-border bg-muted group relative aspect-square overflow-hidden border",
        isDragging && "z-10 opacity-70",
      )}
    >
      <Image
        src={image.url}
        alt={image.altText ?? ""}
        fill
        sizes="(min-width: 768px) 200px, 33vw"
        className="object-cover"
      />

      {isPrimary && (
        <span className="bg-carbon text-beige absolute left-2 top-2 px-2 py-1 text-[10px] uppercase tracking-widest">
          Principal
        </span>
      )}

      <button
        type="button"
        onClick={onDelete}
        aria-label="Eliminar fotografía"
        className="bg-carbon/80 text-beige absolute right-2 top-2 flex size-7 items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
      >
        <X className="size-4" />
      </button>

      <button
        type="button"
        aria-label="Arrastrar para reordenar"
        className="bg-carbon/80 text-beige absolute bottom-2 right-2 flex size-7 cursor-grab items-center justify-center opacity-0 transition-opacity active:cursor-grabbing group-hover:opacity-100"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
    </div>
  );
}
