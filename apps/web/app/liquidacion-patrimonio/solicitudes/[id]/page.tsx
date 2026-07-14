import type { Metadata } from "next";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/layout/container";
import { CancelRequestButton } from "@/components/estate-liquidation/cancel-request-button";
import {
  ESTATE_LIQUIDATION_STATUS_LABELS,
  OUTCOME_LABELS,
} from "@/lib/estate-liquidation/constants";
import { CONDITION_LABELS } from "@/lib/furniture/constants";
import { formatPrice } from "@/lib/format/currency";
import { fetchEstateLiquidationRequest } from "@/lib/api/estate-liquidation";
import { getAccessToken } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Mi liquidación de patrimonio" };

interface PageProps {
  params: Promise<{ id: string }>;
}

const TRACKING_COPY: Record<string, string> = {
  PENDING: "Tu solicitud está en cola. Un especialista la tomará pronto.",
  IN_REVIEW: "Un especialista está clasificando tus piezas en este momento.",
  CANCELLED: "Esta solicitud fue cancelada.",
};

export default async function EstateLiquidationRequestDetailPage({
  params,
}: PageProps) {
  const { id } = await params;
  const accessToken = await getAccessToken();
  if (!accessToken) {
    redirect(
      `/iniciar-sesion?next=${encodeURIComponent(`/liquidacion-patrimonio/solicitudes/${id}`)}`,
    );
  }

  const request = await fetchEstateLiquidationRequest(accessToken, id).catch(
    () => null,
  );
  if (!request) notFound();

  if (request.status === "DRAFT") {
    redirect(`/liquidacion-patrimonio/${id}?paso=1`);
  }

  return (
    <Container className="py-16">
      <div className="max-w-2xl">
        <p className="text-muted-foreground text-sm uppercase tracking-widest">
          Liquidación de Patrimonio
        </p>
        <h1 className="text-foreground mt-3 font-serif text-4xl">
          {request.contactName ?? "Tu solicitud"}
        </h1>

        <div className="border-border mt-10 border-y py-8">
          <p className="text-foreground text-sm uppercase tracking-widest">
            {ESTATE_LIQUIDATION_STATUS_LABELS[request.status]}
          </p>
          <p className="text-muted-foreground mt-3 text-base">
            {TRACKING_COPY[request.status] ?? ""}
          </p>
        </div>

        {request.status === "PENDING" ? (
          <div className="mt-8">
            <CancelRequestButton id={request.id} />
          </div>
        ) : null}
      </div>

      {request.status === "COMPLETED" ? (
        <div className="border-border mt-14 max-w-2xl border-t pt-10">
          <h2 className="text-foreground font-serif text-2xl">
            Resultado por pieza
          </h2>
          <div className="mt-6 flex flex-col divide-y border-t">
            {request.pieces.map((piece) => (
              <div key={piece.id} className="flex gap-4 py-6">
                <div className="bg-muted relative size-16 shrink-0 overflow-hidden">
                  {piece.images[0] ? (
                    <Image
                      src={piece.images[0].url}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground text-sm">{piece.title}</p>
                  <p className="text-muted-foreground mt-1 text-xs uppercase tracking-widest">
                    {piece.outcome ? OUTCOME_LABELS[piece.outcome] : "Sin clasificar"}
                  </p>
                  {piece.condition ? (
                    <p className="text-muted-foreground mt-2 text-sm">
                      Estado: {CONDITION_LABELS[piece.condition]}
                    </p>
                  ) : null}
                  {piece.estimatedValueMin && piece.estimatedValueMax ? (
                    <p className="text-muted-foreground mt-1 text-sm">
                      Valor estimado:{" "}
                      {formatPrice(piece.estimatedValueMin, "CLP")} –{" "}
                      {formatPrice(piece.estimatedValueMax, "CLP")}
                    </p>
                  ) : null}
                  {piece.expertNotes ? (
                    <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                      {piece.expertNotes}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </Container>
  );
}
