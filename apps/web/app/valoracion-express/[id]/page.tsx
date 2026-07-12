import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/layout/container";
import { WizardSteps } from "@/components/valuation/wizard-steps";
import { PhotoUploadStep } from "@/components/valuation/photo-upload-step";
import { InfoStep } from "@/components/valuation/info-step";
import { ObjectiveStep } from "@/components/valuation/objective-step";
import { SummaryStep } from "@/components/valuation/summary-step";
import { PaymentStep } from "@/components/valuation/payment-step";
import { fetchValuationRequest } from "@/lib/api/valuation";
import { fetchTaxonomyOptions } from "@/lib/api/taxonomy";
import { getAccessToken } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Solicitar valoración" };

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paso?: string }>;
}

export default async function ValuationWizardPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { paso } = await searchParams;
  const accessToken = await getAccessToken();
  if (!accessToken) {
    redirect(`/iniciar-sesion?next=${encodeURIComponent(`/valoracion-express/${id}`)}`);
  }

  const request = await fetchValuationRequest(accessToken, id).catch(() => null);
  if (!request) notFound();

  if (request.status !== "DRAFT") {
    redirect(`/valoracion-express/solicitudes/${id}`);
  }

  const step = Math.min(5, Math.max(1, Number(paso ?? "1") || 1));

  const taxonomy = step === 2 ? await fetchTaxonomyOptions() : null;

  return (
    <Container className="py-16">
      <div className="max-w-2xl">
        <p className="text-muted-foreground text-sm uppercase tracking-widest">
          Valoración Express
        </p>
        <div className="mt-4">
          <WizardSteps current={step} />
        </div>
      </div>

      <div className="mt-14 max-w-2xl">
        {step === 1 ? (
          <PhotoUploadStep requestId={request.id} initialImages={request.images} />
        ) : null}
        {step === 2 && taxonomy ? (
          <InfoStep request={request} categories={taxonomy.categories} />
        ) : null}
        {step === 3 ? <ObjectiveStep request={request} /> : null}
        {step === 4 ? <SummaryStep request={request} /> : null}
        {step === 5 ? <PaymentStep request={request} /> : null}
      </div>
    </Container>
  );
}
