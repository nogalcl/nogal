"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { FurnitureImage } from "@/lib/api/types";

export function PieceGallery({
  images,
  title,
}: {
  images: FurnitureImage[];
  title: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex];

  if (!active) {
    return (
      <div className="aspect-4/3 border-border bg-muted flex items-center justify-center border">
        <span className="text-muted-foreground text-xs uppercase tracking-widest">
          Sin fotografías
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-4/3 border-border bg-muted relative w-full overflow-hidden border">
        <Image
          src={active.url}
          alt={active.altText ?? title}
          fill
          priority
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-cover"
        />
      </div>

      {images.length > 1 ? (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Ver fotografía ${index + 1}`}
              className={cn(
                "relative size-20 shrink-0 overflow-hidden border",
                index === activeIndex ? "border-foreground" : "border-border",
              )}
            >
              <Image
                src={image.url}
                alt={image.altText ?? title}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
