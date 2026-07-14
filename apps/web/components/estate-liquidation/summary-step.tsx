import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format/currency";
import type { EstateLiquidationRequest } from "@/lib/api/types";

export function SummaryStep({ request }: { request: EstateLiquidationRequest }) {
  const total = request.unitFee * request.pieces.length;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-foreground font-serif text-2xl">Resumen</h2>
        <p className="text-muted-foreground mt-2 max-w-lg text-sm">
          Revisa que todo esté correcto antes de continuar al pago.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <p className="text-foreground text-sm">Contacto y visita</p>
          <Link
            href={`/liquidacion-patrimonio/${request.id}?paso=1`}
            className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline"
          >
            Editar
          </Link>
        </div>
        <dl className="mt-3 flex flex-col gap-2 text-sm">
          <div className="flex gap-3">
            <dt className="text-muted-foreground w-32 shrink-0">Contacto</dt>
            <dd className="text-foreground">
              {request.contactName} · {request.contactPhone}
            </dd>
          </div>
          <div className="flex gap-3">
            <dt className="text-muted-foreground w-32 shrink-0">Dirección</dt>
            <dd className="text-foreground">
              {[request.addressLine, request.addressCity]
                .filter(Boolean)
                .join(", ")}
            </dd>
          </div>
        </dl>
      </div>

      <div className="border-border border-t pt-6">
        <div className="flex items-center justify-between">
          <p className="text-foreground text-sm">
            Piezas ({request.pieces.length})
          </p>
          <Link
            href={`/liquidacion-patrimonio/${request.id}?paso=2`}
            className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline"
          >
            Editar
          </Link>
        </div>
        <div className="mt-3 flex flex-col gap-4">
          {request.pieces.map((piece) => (
            <div key={piece.id} className="flex items-center gap-3">
              <div className="bg-muted relative size-14 shrink-0 overflow-hidden">
                {piece.images[0] ? (
                  <Image
                    src={piece.images[0].url}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div>
                <p className="text-foreground text-sm">{piece.title}</p>
                <p className="text-muted-foreground text-xs">
                  {piece.images.length}{" "}
                  {piece.images.length === 1 ? "fotografía" : "fotografías"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-border border-t pt-6">
        <div className="flex items-center justify-between">
          <p className="text-foreground text-sm">Total a pagar</p>
          <p className="text-foreground text-lg">
            {formatPrice(total, request.currency)}
          </p>
        </div>
        <p className="text-muted-foreground mt-1 text-xs">
          {formatPrice(request.unitFee, request.currency)} por pieza ×{" "}
          {request.pieces.length}
        </p>
      </div>

      <div>
        <Button asChild>
          <Link href={`/liquidacion-patrimonio/${request.id}?paso=4`}>
            Continuar al pago
          </Link>
        </Button>
      </div>
    </div>
  );
}
