import { CONDITION_LABELS } from "@/lib/furniture/constants";
import { formatPrice } from "@/lib/format/currency";
import { PrintButton } from "./print-button";
import type { ValuationReport } from "@/lib/api/types";

function Field({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="border-border border-t py-4">
      <dt className="text-muted-foreground text-xs uppercase tracking-widest">
        {label}
      </dt>
      <dd className="text-foreground mt-2 text-base leading-relaxed whitespace-pre-line">
        {value}
      </dd>
    </div>
  );
}

export function ReportDocument({
  report,
  pieceTitle,
}: {
  report: ValuationReport;
  pieceTitle: string | null;
}) {
  const materials = report.materials.map((m) => m.name).join(", ");
  const woodTypes = report.woodTypes.map((w) => w.name).join(", ");

  return (
    <div className="print:text-black">
      <div className="flex items-start justify-between gap-4 print:hidden">
        <div>
          <p className="text-muted-foreground text-sm uppercase tracking-widest">
            Informe de valoración
          </p>
          <h1 className="text-foreground mt-2 font-serif text-3xl">
            {pieceTitle ?? "Tu pieza"}
          </h1>
        </div>
        <PrintButton />
      </div>

      <div className="hidden print:block">
        <p className="text-sm uppercase tracking-widest">
          Informe de valoración — Nogal
        </p>
        <h1 className="mt-2 font-serif text-3xl">{pieceTitle ?? "Tu pieza"}</h1>
      </div>

      <p className="text-muted-foreground mt-6 text-sm">
        Preparado por {report.expert.firstName} {report.expert.lastName} ·{" "}
        {new Date(report.providedAt).toLocaleDateString("es-CL", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      {report.confidenceLevel !== null ? (
        <p className="text-muted-foreground mt-2 text-sm">
          Nivel de confianza: {report.confidenceLevel}%
        </p>
      ) : null}

      <dl className="mt-8">
        <Field label="Resumen" value={report.summary} />
        <Field label="Identificación probable" value={report.probableIdentification} />
        <Field label="Materiales" value={materials} />
        <Field label="Tipo de madera" value={woodTypes} />
        <Field label="Estilo" value={report.style?.name} />
        <Field label="Década" value={report.decade ? `Años ${report.decade}` : null} />
        <Field label="Diseñador" value={report.designer?.name} />
        <Field label="Fabricante" value={report.manufacturer?.name} />
        <Field
          label="Estado"
          value={report.condition ? CONDITION_LABELS[report.condition] : null}
        />
        <Field label="Observaciones" value={report.observations} />
        <Field label="Advertencias" value={report.warnings} />
        <Field
          label="Valor estimado"
          value={`${formatPrice(report.estimatedValueMin, report.currency)} – ${formatPrice(report.estimatedValueMax, report.currency)}`}
        />
        <Field
          label="Venta rápida"
          value={
            report.quickSaleValue
              ? formatPrice(report.quickSaleValue, report.currency)
              : null
          }
        />
        <Field
          label="Venta ideal"
          value={
            report.idealSaleValue
              ? formatPrice(report.idealSaleValue, report.currency)
              : null
          }
        />
        <Field label="Tiempo estimado de venta" value={report.estimatedSaleTime} />
        <Field label="Consejos" value={report.tips} />
      </dl>
    </div>
  );
}
