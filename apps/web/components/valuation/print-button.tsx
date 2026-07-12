"use client";

import { Button } from "@/components/ui/button";

/** Soporte de PDF sin pipeline server-side: la vista de informe ya está
 * optimizada para impresión (ver globals de impresión en report-document.tsx),
 * así que "Guardar como PDF" funciona vía el diálogo de impresión del
 * navegador. `pdfUrl` queda listo en el schema para cuando exista
 * generación real server-side. */
export function PrintButton() {
  return (
    <Button variant="outline" onClick={() => window.print()} className="print:hidden">
      Guardar como PDF
    </Button>
  );
}
