import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/layout/container";
import { AssignExpertForm } from "@/components/valuation/assign-expert-form";
import { StatusActions } from "@/components/valuation/status-actions";
import { InternalComments } from "@/components/valuation/internal-comments";
import { HistoryTimeline } from "@/components/valuation/history-timeline";
import { ReportEditorForm } from "@/components/valuation/report-editor-form";
import {
  OBJECTIVE_LABELS,
  VALUATION_STATUS_LABELS,
} from "@/lib/valuation/constants";
import {
  fetchValuationExperts,
  fetchValuationRequest,
} from "@/lib/api/valuation";
import { fetchTaxonomyOptions } from "@/lib/api/taxonomy";
import { fetchCurrentUser } from "@/lib/api/auth";
import { getAccessToken } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Solicitud de valoración" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ValuationStaffDetailPage({ params }: PageProps) {
  const { id } = await params;
  const accessToken = await getAccessToken();
  if (!accessToken) {
    redirect("/iniciar-sesion?next=/valoracion-express/panel");
  }

  const user = await fetchCurrentUser(accessToken);
  if (!user || (user.role !== "MODERATOR" && user.role !== "ADMIN")) {
    redirect("/");
  }

  const [request, experts, taxonomy] = await Promise.all([
    fetchValuationRequest(accessToken, id).catch(() => null),
    fetchValuationExperts(accessToken),
    fetchTaxonomyOptions(),
  ]);
  if (!request) notFound();

  const canEditReport = request.status === "IN_REVIEW" || request.status === "COMPLETED";

  return (
    <Container className="py-16">
      <Link
        href="/valoracion-express/panel"
        className="text-muted-foreground hover:text-foreground text-sm"
      >
        ← Panel
      </Link>

      <div className="mt-6 grid gap-16 lg:grid-cols-[1fr_320px]">
        <div>
          <p className="text-muted-foreground text-sm uppercase tracking-widest">
            {VALUATION_STATUS_LABELS[request.status]}
          </p>
          <h1 className="text-foreground mt-2 font-serif text-3xl">
            {request.title ?? "Solicitud sin título"}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {request.requester.firstName} {request.requester.lastName} ·{" "}
            {request.objective ? OBJECTIVE_LABELS[request.objective] : "—"}
          </p>

          {request.images.length > 0 ? (
            <div className="mt-6 grid grid-cols-4 gap-3 sm:grid-cols-6">
              {request.images.map((image) => (
                <div
                  key={image.id}
                  className="bg-muted relative aspect-square overflow-hidden"
                >
                  <Image
                    src={image.url}
                    alt={image.altText ?? ""}
                    fill
                    sizes="150px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : null}

          <p className="text-muted-foreground mt-6 max-w-xl text-sm leading-relaxed whitespace-pre-line">
            {request.description}
          </p>

          <dl className="mt-6 flex flex-col gap-2 text-sm">
            {request.category ? (
              <div className="flex gap-3">
                <dt className="text-muted-foreground w-32 shrink-0">Categoría</dt>
                <dd className="text-foreground">{request.category.name}</dd>
              </div>
            ) : null}
            {request.estimatedDecade ? (
              <div className="flex gap-3">
                <dt className="text-muted-foreground w-32 shrink-0">
                  Década aproximada
                </dt>
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

          <div className="border-border mt-12 border-t pt-10">
            <p className="text-foreground text-sm">Informe</p>
            {canEditReport ? (
              <div className="mt-6">
                <ReportEditorForm
                  request={request}
                  report={request.report}
                  taxonomy={taxonomy}
                />
              </div>
            ) : (
              <p className="text-muted-foreground mt-4 text-sm">
                {request.status === "PENDING"
                  ? "Inicia la revisión para poder generar el informe."
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
