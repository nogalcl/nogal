import Image from "next/image";
import Link from "next/link";
import { CONDITION_LABELS } from "@/lib/furniture/constants";
import { formatPrice } from "@/lib/format/currency";
import { cn } from "@/lib/utils";
import type { FurniturePreview } from "@/lib/api/types";

export function PieceCard({
  piece,
  featured = false,
}: {
  piece: FurniturePreview;
  featured?: boolean;
}) {
  const meta = [
    piece.primaryMaterial,
    piece.decade ? `Años ${piece.decade}` : null,
    piece.condition ? CONDITION_LABELS[piece.condition] : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={`/piezas/${piece.slug}`}
      className={cn("group flex flex-col", featured ? "col-span-2" : null)}
    >
      <div
        className={cn(
          "bg-muted relative w-full overflow-hidden",
          featured ? "aspect-16/10" : "aspect-4/5",
        )}
      >
        {piece.primaryImage ? (
          <Image
            src={piece.primaryImage.url}
            alt={piece.primaryImage.altText ?? piece.title}
            fill
            sizes={
              featured
                ? "(min-width: 1024px) 46vw, 90vw"
                : "(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 90vw"
            }
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <span className="text-muted-foreground absolute inset-0 flex items-center justify-center text-xs uppercase tracking-widest">
            Sin fotografía
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-1">
        {meta ? (
          <p className="text-muted-foreground text-xs uppercase tracking-widest">
            {meta}
          </p>
        ) : null}
        <h3
          className={cn(
            "text-foreground font-serif leading-snug",
            featured ? "text-2xl" : "text-lg",
          )}
        >
          {piece.title}
        </h3>
        {piece.locationCity ? (
          <p className="text-muted-foreground text-xs">
            {piece.locationCity}
          </p>
        ) : null}
        <p className="text-foreground mt-1 text-sm tabular-nums">
          {formatPrice(piece.price, piece.currency)}
        </p>
      </div>
    </Link>
  );
}
