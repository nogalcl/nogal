import Image from "next/image";
import Link from "next/link";
import { CONDITION_LABELS } from "@/lib/furniture/constants";
import { formatPrice } from "@/lib/format/currency";
import type { FurniturePreview } from "@/lib/api/types";

export function PieceCard({ piece }: { piece: FurniturePreview }) {
  const meta = [
    piece.primaryMaterial,
    piece.decade ? `Años ${piece.decade}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const conditionAndLocation = [
    piece.condition ? CONDITION_LABELS[piece.condition] : null,
    piece.locationCity,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link href={`/piezas/${piece.slug}`} className="group flex flex-col gap-3">
      <div className="aspect-4/5 border-border bg-muted relative w-full overflow-hidden border">
        {piece.primaryImage ? (
          <Image
            src={piece.primaryImage.url}
            alt={piece.primaryImage.altText ?? piece.title}
            fill
            sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 90vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <span className="text-muted-foreground absolute inset-0 flex items-center justify-center text-xs uppercase tracking-widest">
            Sin fotografía
          </span>
        )}
      </div>

      <div>
        <h3 className="text-foreground text-base">{piece.title}</h3>
        {meta ? (
          <p className="text-muted-foreground mt-1 text-sm">{meta}</p>
        ) : null}
        {conditionAndLocation ? (
          <p className="text-muted-foreground mt-1 text-sm">
            {conditionAndLocation}
          </p>
        ) : null}
        <p className="text-foreground mt-2 text-base">
          {formatPrice(piece.price, piece.currency)}
        </p>
      </div>
    </Link>
  );
}
