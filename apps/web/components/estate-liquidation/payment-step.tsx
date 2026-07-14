"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/forms/form-error";
import { formatPrice } from "@/lib/format/currency";
import { confirmEstateLiquidationPaymentAction } from "@/lib/estate-liquidation/actions";
import type { EstateLiquidationRequest } from "@/lib/api/types";

export function PaymentStep({ request }: { request: EstateLiquidationRequest }) {
  const [state, formAction, pending] = useActionState(
    confirmEstateLiquidationPaymentAction,
    null,
  );
  const total = request.unitFee * request.pieces.length;

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div>
        <h2 className="text-foreground font-serif text-2xl">Pago</h2>
        <p className="text-muted-foreground mt-2 max-w-lg text-sm">
          Este es un pago simulado — todavía no hay una pasarela real
          conectada. Al confirmar, tu solicitud queda enviada y en cola para
          revisión.
        </p>
      </div>

      <FormError message={state?.error} />
      <input type="hidden" name="id" value={request.id} />

      <div className="border-border flex items-center justify-between border-y py-6">
        <p className="text-foreground text-sm">
          Liquidación de Patrimonio — {request.pieces.length}{" "}
          {request.pieces.length === 1 ? "pieza" : "piezas"}
        </p>
        <p className="text-foreground text-lg">
          {formatPrice(total, request.currency)}
        </p>
      </div>

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Procesando…" : "Confirmar pago simulado"}
        </Button>
      </div>
    </form>
  );
}
