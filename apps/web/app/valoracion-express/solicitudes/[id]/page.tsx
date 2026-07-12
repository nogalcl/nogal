import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/layout/container";
import { ReportDocument } from "@/components/valuation/report-document";
import { CancelRequestButton } from "@/components/valuation/cancel-request-button";
import { OBJECTIVE_LABELS, VALUATION_STATUS_LABELS } from "@/lib/valuation/constants";
import { fetchValuationRequest } from "@/lib/api/valuation";
import { getAccessToken } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Mi solicitud de valoración" };

interface PageProps {
  params: Promise<{ id: string }>;
}

const TRACKING_COPY: Record<string, string> = {
  PENDING: "Tu solicitud está en cola. Un especialista la tomará pronto.",
  IN_REVIEW: "Un especialista está revisando tu pieza en este momento.",
  CANCELLED: "Esta solicitud fue cancelada.",
};

export default async function ValuationRequestDetailPage({ params }: PageProps) {
  const { id } = await params;
  const accessToken = await getAccessToken();
  if (!accessToken) {
    redirect(`/iniciar-sesion?next=${encodeURIComponent(`/valoracion-express/solicitudes/${id}`)}`);
  }

  const request = await fetchValuationRequest(accessToken, id).catch(() => null);
  if (!request) notFound();

  if (request.status === "DRAFT") {
    redirect(`/valoracion-express/${id}?paso=1`);
  }

  if (request.status === "COMPLETED" && request.report) {
    return (
      <Container className="py-16">
        <div className="max-w-2xl">
          <ReportDocument report={request.report} pieceTitle={request.title} />
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-16">
      <div className="max-w-2xl">
        <p className="text-muted-foreground text-sm uppercase tracking-widest">
          Valoración Express
        </p>
        <h1 className="text-foreground mt-3 font-serif text-4xl">
          {request.title ?? "Tu solicitud"}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {request.objective ? OBJECTIVE_LABELS[request.objective] : ""}
        </p>

        <div className="border-border mt-10 border-y py-8">
          <p className="text-foreground text-sm uppercase tracking-widest">
            {VALUATION_STATUS_LABELS[request.status]}
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
    </Container>
  );
}
