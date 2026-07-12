import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/container";
import { OBJECTIVE_LABELS, VALUATION_STATUS_LABELS } from "@/lib/valuation/constants";
import { fetchMyValuationRequests } from "@/lib/api/valuation";
import { getAccessToken } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Mis valoraciones" };

function requestHref(status: string, id: string): string {
  return status === "DRAFT"
    ? `/valoracion-express/${id}?paso=1`
    : `/valoracion-express/solicitudes/${id}`;
}

export default async function MyValuationRequestsPage() {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    redirect("/iniciar-sesion?next=/valoracion-express/solicitudes");
  }

  const requests = await fetchMyValuationRequests(accessToken);

  return (
    <Container className="py-16">
      <p className="text-muted-foreground text-sm uppercase tracking-widest">
        Valoración Express
      </p>
      <h1 className="text-foreground mt-3 font-serif text-4xl">
        Mis solicitudes
      </h1>

      {requests.length === 0 ? (
        <div className="border-border bg-card mt-12 border px-8 py-20 text-center">
          <p className="text-foreground font-serif text-2xl">
            Todavía no solicitaste una valoración
          </p>
          <Link
            href="/valoracion-express"
            className="text-foreground mt-4 inline-block text-sm hover:underline"
          >
            Comenzar una valoración
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
              <div className="bg-muted relative size-16 shrink-0 overflow-hidden">
                {request.images[0] ? (
                  <Image
                    src={request.images[0].url}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate text-sm">
                  {request.title ?? "Solicitud sin título"}
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {request.objective ? OBJECTIVE_LABELS[request.objective] : "—"}
                </p>
              </div>
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
