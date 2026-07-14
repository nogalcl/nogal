import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/container";
import { ESTATE_LIQUIDATION_STATUS_LABELS } from "@/lib/estate-liquidation/constants";
import { fetchMyEstateLiquidationRequests } from "@/lib/api/estate-liquidation";
import { getAccessToken } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Mis liquidaciones de patrimonio" };

function requestHref(status: string, id: string): string {
  return status === "DRAFT"
    ? `/liquidacion-patrimonio/${id}?paso=1`
    : `/liquidacion-patrimonio/solicitudes/${id}`;
}

export default async function MyEstateLiquidationRequestsPage() {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    redirect("/iniciar-sesion?next=/liquidacion-patrimonio/solicitudes");
  }

  const requests = await fetchMyEstateLiquidationRequests(accessToken);

  return (
    <Container className="py-16">
      <p className="text-muted-foreground text-sm uppercase tracking-widest">
        Liquidación de Patrimonio
      </p>
      <h1 className="text-foreground mt-3 font-serif text-4xl">
        Mis solicitudes
      </h1>

      {requests.length === 0 ? (
        <div className="border-border bg-card mt-12 border px-8 py-20 text-center">
          <p className="text-foreground font-serif text-2xl">
            Todavía no iniciaste una solicitud
          </p>
          <Link
            href="/liquidacion-patrimonio"
            className="text-foreground mt-4 inline-block text-sm hover:underline"
          >
            Comenzar una solicitud
          </Link>
        </div>
      ) : (
        <div className="border-border mt-12 flex flex-col divide-y border-t">
          {requests.map((request) => (
            <Link
              key={request.id}
              href={requestHref(request.status, request.id)}
              className="hover:bg-muted flex items-center gap-4 py-5 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate text-sm">
                  {request.contactName ?? "Solicitud sin nombre"}
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {request.pieces.length}{" "}
                  {request.pieces.length === 1 ? "pieza" : "piezas"}
                </p>
              </div>
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
