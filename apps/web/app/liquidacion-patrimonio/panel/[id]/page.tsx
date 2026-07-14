import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { AssignExpertForm } from "@/components/estate-liquidation/assign-expert-form";
import { StatusActions } from "@/components/estate-liquidation/status-actions";
import { InternalComments } from "@/components/estate-liquidation/internal-comments";
import { HistoryTimeline } from "@/components/estate-liquidation/history-timeline";
import { PieceClassifyForm } from "@/components/estate-liquidation/piece-classify-form";
import { CompleteReviewButton } from "@/components/estate-liquidation/complete-review-button";
import { ESTATE_LIQUIDATION_STATUS_LABELS } from "@/lib/estate-liquidation/constants";
import {
  fetchEstateLiquidationExperts,
  fetchEstateLiquidationRequest,
} from "@/lib/api/estate-liquidation";
import { fetchRestorers } from "@/lib/api/admin";
import { requireStaff } from "@/lib/auth/require-staff";

export const metadata: Metadata = { title: "Solicitud de liquidación de patrimonio" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EstateLiquidationStaffDetailPage({
  params,
}: PageProps) {
  const { id } = await params;
  const { accessToken } = await requireStaff(
    ["MODERATOR", "ADMIN"],
    "/liquidacion-patrimonio/panel",
  );

  const [request, experts, restorers] = await Promise.all([
    fetchEstateLiquidationRequest(accessToken, id).catch(() => null),
    fetchEstateLiquidationExperts(accessToken),
    fetchRestorers(accessToken),
  ]);
  if (!request) notFound();

  const activeRestorers = restorers.filter((restorer) => restorer.isActive);
  const canClassify = request.status === "IN_REVIEW";
  const allClassified =
    request.pieces.length > 0 && request.pieces.every((piece) => piece.outcome);

  return (
    <Container className="py-16">
      <Link
        href="/liquidacion-patrimonio/panel"
        className="text-muted-foreground hover:text-foreground text-sm"
      >
        ← Panel
      </Link>

      <div className="mt-6 grid gap-16 lg:grid-cols-[1fr_320px]">
        <div>
          <p className="text-muted-foreground text-sm uppercase tracking-widest">
            {ESTATE_LIQUIDATION_STATUS_LABELS[request.status]}
          </p>
          <h1 className="text-foreground mt-2 font-serif text-3xl">
            {request.contactName ?? "Solicitud sin nombre"}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {request.requester.firstName} {request.requester.lastName} ·{" "}
            {request.contactPhone}
          </p>

          <dl className="mt-6 flex flex-col gap-2 text-sm">
            <div className="flex gap-3">
              <dt className="text-muted-foreground w-32 shrink-0">Dirección</dt>
              <dd className="text-foreground">
                {[request.addressLine, request.addressCity, request.addressRegion]
                  .filter(Boolean)
                  .join(", ")}
              </dd>
            </div>
            {request.visitNotes ? (
              <div className="flex gap-3">
                <dt className="text-muted-foreground w-32 shrink-0">
                  Notas de acceso
                </dt>
                <dd className="text-foreground">{request.visitNotes}</dd>
              </div>
            ) : null}
          </dl>

          <div className="border-border mt-12 border-t pt-10">
            <div className="flex items-center justify-between">
              <p className="text-foreground text-sm">
                Piezas ({request.pieces.length})
              </p>
              {canClassify ? (
                <div className="w-56">
                  <CompleteReviewButton
                    requestId={request.id}
                    allClassified={allClassified}
                  />
                </div>
              ) : null}
            </div>

            {canClassify ? (
              <div className="mt-2 flex flex-col">
                {request.pieces.map((piece) => (
                  <PieceClassifyForm
                    key={piece.id}
                    requestId={request.id}
                    piece={piece}
                    restorers={activeRestorers}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground mt-4 text-sm">
                {request.status === "PENDING"
                  ? "Inicia la revisión para poder clasificar las piezas."
                  : request.status === "COMPLETED"
                    ? "Esta revisión ya fue completada."
                    : "Esta solicitud fue cancelada."}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-10">
          <div>
            <p className="text-foreground text-sm">Asignación</p>
            <div className="mt-3">
              <AssignExpertForm
                requestId={request.id}
                experts={experts}
                currentExpertId={request.assignedExpert?.id}
              />
            </div>
          </div>

          <div>
            <p className="text-foreground text-sm">Acciones</p>
            <div className="mt-3">
              <StatusActions requestId={request.id} status={request.status} />
            </div>
          </div>

          <div>
            <InternalComments requestId={request.id} comments={request.comments} />
          </div>

          <div>
            <p className="text-foreground text-sm">Historial</p>
            <div className="mt-3">
              <HistoryTimeline entries={request.history} />
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
