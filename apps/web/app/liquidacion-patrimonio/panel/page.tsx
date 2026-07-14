import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { ESTATE_LIQUIDATION_STATUS_LABELS } from "@/lib/estate-liquidation/constants";
import { fetchEstateLiquidationRequestsForStaff } from "@/lib/api/estate-liquidation";
import { requireStaff } from "@/lib/auth/require-staff";
import type { EstateLiquidationRequestStatus } from "@/lib/api/types";

export const metadata: Metadata = { title: "Panel de liquidaciones de patrimonio" };

const STATUS_FILTERS: Array<{
  value: EstateLiquidationRequestStatus | "";
  label: string;
}> = [
  { value: "", label: "Todas" },
  { value: "PENDING", label: "En cola" },
  { value: "IN_REVIEW", label: "En revisión" },
  { value: "COMPLETED", label: "Completadas" },
  { value: "CANCELLED", label: "Canceladas" },
];

interface PageProps {
  searchParams: Promise<{ estado?: string; mias?: string }>;
}

export default async function EstateLiquidationStaffPanelPage({
  searchParams,
}: PageProps) {
  const { accessToken } = await requireStaff(
    ["MODERATOR", "ADMIN"],
    "/liquidacion-patrimonio/panel",
  );

  const { estado, mias } = await searchParams;
  const status = (estado as EstateLiquidationRequestStatus | undefined) || undefined;
  const assignedToMe = mias === "1";

  const requests = await fetchEstateLiquidationRequestsForStaff(accessToken, {
    status,
    assignedToMe,
  });

  function filterHref(overrides: { estado?: string; mias?: string }) {
    const params = new URLSearchParams();
    const nextEstado = overrides.estado ?? estado;
    const nextMias = overrides.mias ?? mias;
    if (nextEstado) params.set("estado", nextEstado);
    if (nextMias) params.set("mias", nextMias);
    const qs = params.toString();
    return qs
      ? `/liquidacion-patrimonio/panel?${qs}`
      : "/liquidacion-patrimonio/panel";
  }

  return (
    <Container className="py-16">
      <p className="text-muted-foreground text-sm uppercase tracking-widest">
        Panel experto
      </p>
      <h1 className="text-foreground mt-3 font-serif text-4xl">
        Liquidaciones de patrimonio
      </h1>

      <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3">
        <div className="flex flex-wrap gap-4">
          {STATUS_FILTERS.map((filter) => (
            <Link
              key={filter.value}
              href={filterHref({ estado: filter.value })}
              className={
                (status ?? "") === filter.value
                  ? "text-foreground text-sm underline underline-offset-4"
                  : "text-muted-foreground hover:text-foreground text-sm"
              }
            >
              {filter.label}
            </Link>
          ))}
        </div>
        <Link
          href={filterHref({ mias: mias === "1" ? "" : "1" })}
          className={
            assignedToMe
              ? "text-foreground text-sm underline underline-offset-4"
              : "text-muted-foreground hover:text-foreground text-sm"
          }
        >
          Asignadas a mí
        </Link>
      </div>

      {requests.length === 0 ? (
        <p className="text-muted-foreground mt-12 text-sm">
          No hay solicitudes con estos filtros.
        </p>
      ) : (
        <div className="border-border mt-10 flex flex-col divide-y border-t">
          {requests.map((request) => (
            <Link
              key={request.id}
              href={`/liquidacion-patrimonio/panel/${request.id}`}
              className="hover:bg-muted flex items-center gap-4 py-5 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate text-sm">
                  {request.contactName ?? "Solicitud sin nombre"}
                </p>
                <p className="text-muted-foreground mt-1 truncate text-sm">
                  {request.requester.firstName} {request.requester.lastName} ·{" "}
                  {request.pieces.length}{" "}
                  {request.pieces.length === 1 ? "pieza" : "piezas"}
                </p>
              </div>
              {request.assignedExpert ? (
                <p className="text-muted-foreground shrink-0 text-xs">
                  {request.assignedExpert.firstName}
                </p>
              ) : null}
              <span className="text-muted-foreground shrink-0 text-xs uppercase tracking-widest">
                {ESTATE_LIQUIDATION_STATUS_LABELS[request.status]}
              </span>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
