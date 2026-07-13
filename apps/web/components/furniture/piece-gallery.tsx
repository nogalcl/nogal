"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X as XIcon } from "lucide-react";
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
  const [isExpanded, setIsExpanded] = useState(false);
  const active = images[activeIndex];

  useEffect(() => {
    if (!isExpanded) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setIsExpanded(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isExpanded]);

  if (!active) {
    return (
      <div className="aspect-4/3 bg-muted flex items-center justify-center">
        <span className="text-muted-foreground text-xs uppercase tracking-widest">
          Sin fotografías
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setIsExpanded(true)}
        aria-label="Ver fotografía a pantalla completa"
        className="aspect-4/3 bg-muted relative w-full cursor-zoom-in overflow-hidden"
      >
        <Image
          src={active.url}
          alt={active.altText ?? title}
          fill
          priority
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-cover"
        />
      </button>

      {images.length > 1 ? (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Ver fotografía ${index + 1}`}
              className={cn(
                "relative size-20 shrink-0 overflow-hidden transition-opacity",
                index === activeIndex
                  ? "opacity-100"
                  : "opacity-50 hover:opacity-80",
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

      {isExpanded ? (
        <div
          role="dialog"
          aria-modal="true"
          className="bg-carbon/95 fixed inset-0 z-50 flex items-center justify-center p-6"
          onClick={() => setIsExpanded(false)}
        >
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            aria-label="Cerrar"
            className="text-beige absolute right-6 top-6 flex size-10 items-center justify-center"
          >
            <XIcon className="size-6" />
          </button>
          <div className="relative h-full w-full max-w-5xl">
            <Image
              src={active.url}
              alt={active.altText ?? title}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
