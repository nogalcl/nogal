import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/container";
import { OBJECTIVE_LABELS, VALUATION_STATUS_LABELS } from "@/lib/valuation/constants";
import { fetchValuationRequestsForStaff } from "@/lib/api/valuation";
import { fetchCurrentUser } from "@/lib/api/auth";
import { getAccessToken } from "@/lib/auth/session";
import type { ValuationRequestStatus } from "@/lib/api/types";

export const metadata: Metadata = { title: "Panel de valoraciones" };

const STATUS_FILTERS: Array<{ value: ValuationRequestStatus | ""; label: string }> = [
  { value: "", label: "Todas" },
  { value: "PENDING", label: "En cola" },
  { value: "IN_REVIEW", label: "En revisión" },
  { value: "COMPLETED", label: "Completadas" },
  { value: "CANCELLED", label: "Canceladas" },
];

interface PageProps {
  searchParams: Promise<{ estado?: string; mias?: string }>;
}

export default async function ValuationStaffPanelPage({ searchParams }: PageProps) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    redirect("/iniciar-sesion?next=/valoracion-express/panel");
  }

  const user = await fetchCurrentUser(accessToken);
  if (!user || (user.role !== "MODERATOR" && user.role !== "ADMIN")) {
    redirect("/");
  }

  const { estado, mias } = await searchParams;
  const status = (estado as ValuationRequestStatus | undefined) || undefined;
  const assignedToMe = mias === "1";

  const requests = await fetchValuationRequestsForStaff(accessToken, {
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
    return qs ? `/valoracion-express/panel?${qs}` : "/valoracion-express/panel";
  }

  return (
    <Container className="py-16">
      <p className="text-muted-foreground text-sm uppercase tracking-widest">
        Panel experto
      </p>
      <h1 className="text-foreground mt-3 font-serif text-4xl">
        Valoraciones
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
              href={`/valoracion-express/panel/${request.id}`}
              className="hover:bg-muted flex items-center gap-4 py-5 transition-colors"
            >
              <div className="bg-muted relative size-14 shrink-0 overflow-hidden">
                {request.images[0] ? (
                  <Image
                    src={request.images[0].url}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate text-sm">
                  {request.title ?? "Solicitud sin título"}
                </p>
                <p className="text-muted-foreground mt-1 truncate text-sm">
                  {request.requester.firstName} {request.requester.lastName} ·{" "}
                  {request.objective ? OBJECTIVE_LABELS[request.objective] : "—"}
                </p>
              </div>
              {request.assignedExpert ? (
                <p className="text-muted-foreground shrink-0 text-xs">
                  {request.assignedExpert.firstName}
                </p>
              ) : null}
              <span className="text-muted-foreground shrink-0 text-xs uppercase tracking-widest">
                {VALUATION_STATUS_LABELS[request.status]}
              </span>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
