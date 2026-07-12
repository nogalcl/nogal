import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { OBJECTIVE_LABELS } from "@/lib/valuation/constants";
import type { ValuationRequest } from "@/lib/api/types";

export function SummaryStep({ request }: { request: ValuationRequest }) {
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
          <p className="text-foreground text-sm">Fotografías</p>
          <Link
            href={`/valoracion-express/${request.id}?paso=1`}
            className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline"
          >
            Editar
          </Link>
        </div>
        <div className="mt-3 flex gap-3">
          {request.images.map((image) => (
            <div
              key={image.id}
              className="bg-muted relative size-20 shrink-0 overflow-hidden"
            >
              <Image
                src={image.url}
                alt={image.altText ?? ""}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="border-border border-t pt-6">
        <div className="flex items-center justify-between">
          <p className="text-foreground text-sm">Información</p>
          <Link
            href={`/valoracion-express/${request.id}?paso=2`}
            className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline"
          >
            Editar
          </Link>
        </div>
        <dl className="mt-3 flex flex-col gap-2 text-sm">
          <div className="flex gap-3">
            <dt className="text-muted-foreground w-32 shrink-0">Pieza</dt>
            <dd className="text-foreground">{request.title}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="text-muted-foreground w-32 shrink-0">Descripción</dt>
            <dd className="text-foreground">{request.description}</dd>
          </div>
          {request.category ? (
            <div className="flex gap-3">
              <dt className="text-muted-foreground w-32 shrink-0">Categoría</dt>
              <dd className="text-foreground">{request.category.name}</dd>
            </div>
          ) : null}
          {request.estimatedDecade ? (
            <div className="flex gap-3">
              <dt className="text-muted-foreground w-32 shrink-0">Década</dt>
              <dd className="text-foreground">Años {request.estimatedDecade}</dd>
            </div>
          ) : null}
          {request.locationCity ? (
            <div className="flex gap-3">
              <dt className="text-muted-foreground w-32 shrink-0">Ciudad</dt>
              <dd className="text-foreground">{request.locationCity}</dd>
            </div>
          ) : null}
        </dl>
      </div>

      <div className="border-border border-t pt-6">
        <div className="flex items-center justify-between">
          <p className="text-foreground text-sm">Objetivo</p>
          <Link
            href={`/valoracion-express/${request.id}?paso=3`}
            className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline"
          >
            Editar
          </Link>
        </div>
        <p className="text-foreground mt-3 text-sm">
          {request.objective ? OBJECTIVE_LABELS[request.objective] : "—"}
        </p>
      </div>

      <div>
        <Button asChild>
          <Link href={`/valoracion-express/${request.id}?paso=5`}>
            Continuar al pago
          </Link>
        </Button>
      </div>
    </div>
  );
}
