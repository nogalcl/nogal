import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PieceForm } from "./piece-form";
import { PiecePhotoUpload } from "./piece-photo-upload";
import { RemovePieceButton } from "./remove-piece-button";
import type { Category, EstateLiquidationRequest } from "@/lib/api/types";

export function PiecesStep({
  request,
  categories,
}: {
  request: EstateLiquidationRequest;
  categories: Category[];
}) {
  const pieces = request.pieces;
  const canContinue =
    pieces.length > 0 && pieces.every((piece) => piece.images.length > 0);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-foreground font-serif text-2xl">Piezas</h2>
        <p className="text-muted-foreground mt-2 max-w-lg text-sm">
          Agrega cada pieza que quieres que evaluemos, con al menos una
          fotografía. Puedes agregar todas las que necesites.
        </p>
      </div>

      {pieces.length > 0 ? (
        <div className="border-border flex flex-col divide-y border-t">
          {pieces.map((piece) => (
            <div key={piece.id} className="flex flex-col gap-3 py-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-foreground text-sm">{piece.title}</p>
                  {piece.description ? (
                    <p className="text-muted-foreground mt-1 text-sm">
                      {piece.description}
                    </p>
                  ) : null}
                </div>
                <RemovePieceButton pieceId={piece.id} requestId={request.id} />
              </div>
              <PiecePhotoUpload
                pieceId={piece.id}
                requestId={request.id}
                initialImages={piece.images}
              />
            </div>
          ))}
        </div>
      ) : null}

      <PieceForm requestId={request.id} categories={categories} />

      <div>
        <Button asChild disabled={!canContinue}>
          <Link
            href={canContinue ? `/liquidacion-patrimonio/${request.id}?paso=3` : "#"}
            aria-disabled={!canContinue}
          >
            Siguiente
          </Link>
        </Button>
        {!canContinue ? (
          <p className="text-muted-foreground mt-2 text-sm">
            Agrega al menos una pieza con una fotografía para continuar.
          </p>
        ) : null}
      </div>
    </div>
  );
}
