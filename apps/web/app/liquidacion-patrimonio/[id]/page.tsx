import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/layout/container";
import { WizardSteps } from "@/components/estate-liquidation/wizard-steps";
import { ContactStep } from "@/components/estate-liquidation/contact-step";
import { PiecesStep } from "@/components/estate-liquidation/pieces-step";
import { SummaryStep } from "@/components/estate-liquidation/summary-step";
import { PaymentStep } from "@/components/estate-liquidation/payment-step";
import { fetchEstateLiquidationRequest } from "@/lib/api/estate-liquidation";
import { fetchTaxonomyOptions } from "@/lib/api/taxonomy";
import { getAccessToken } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Solicitar liquidación de patrimonio" };

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paso?: string }>;
}

export default async function EstateLiquidationWizardPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { paso } = await searchParams;
  const accessToken = await getAccessToken();
  if (!accessToken) {
    redirect(
      `/iniciar-sesion?next=${encodeURIComponent(`/liquidacion-patrimonio/${id}`)}`,
    );
  }

  const request = await fetchEstateLiquidationRequest(accessToken, id).catch(
    () => null,
  );
  if (!request) notFound();

  if (request.status !== "DRAFT") {
    redirect(`/liquidacion-patrimonio/solicitudes/${id}`);
  }

  const step = Math.min(4, Math.max(1, Number(paso ?? "1") || 1));

  const taxonomy = step === 2 ? await fetchTaxonomyOptions() : null;

  return (
    <Container className="py-16">
      <div className="max-w-2xl">
        <p className="text-muted-foreground text-sm uppercase tracking-widest">
          Liquidación de Patrimonio
        </p>
        <div className="mt-4">
          <WizardSteps current={step} />
        </div>
      </div>

      <div className="mt-14 max-w-2xl">
        {step === 1 ? <ContactStep request={request} /> : null}
        {step === 2 && taxonomy ? (
          <PiecesStep request={request} categories={taxonomy.categories} />
        ) : null}
        {step === 3 ? <SummaryStep request={request} /> : null}
        {step === 4 ? <PaymentStep request={request} /> : null}
      </div>
    </Container>
  );
}
