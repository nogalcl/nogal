"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/forms/form-error";
import { FormField } from "@/components/forms/form-field";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CONDITION_OPTIONS } from "@/lib/furniture/constants";
import { saveValuationReportAction } from "@/lib/valuation/actions";
import type { TaxonomyOptions } from "@/lib/api/taxonomy";
import type { ValuationReport, ValuationRequest } from "@/lib/api/types";

function CheckboxGroup({
  name,
  options,
  defaultValues,
}: {
  name: string;
  options: Array<{ id: string; name: string }>;
  defaultValues: string[];
}) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2">
      {options.map((option) => (
        <label key={option.id} className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name={name}
            value={option.id}
            defaultChecked={defaultValues.includes(option.id)}
            className="border-border size-4"
          />
          {option.name}
        </label>
      ))}
    </div>
  );
}

export function ReportEditorForm({
  request,
  report,
  taxonomy,
}: {
  request: ValuationRequest;
  report: ValuationReport | null;
  taxonomy: TaxonomyOptions;
}) {
  const [state, formAction, pending] = useActionState(
    saveValuationReportAction,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <FormError message={state?.error} />
      <input type="hidden" name="requestId" value={request.id} />
      <input type="hidden" name="hasReport" value={report ? "true" : "false"} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="summary" className="text-foreground text-sm">
          Resumen
        </Label>
        <Textarea
          id="summary"
          name="summary"
          rows={3}
          required
          defaultValue={report?.summary ?? ""}
        />
      </div>

      <FormField
        label="Identificación probable"
        name="probableIdentification"
        placeholder="Ej. Silla Wegner CH24, posible reproducción tardía"
        defaultValue={report?.probableIdentification ?? ""}
      />

      <div className="flex flex-col gap-2">
        <Label className="text-foreground text-sm">Materiales</Label>
        <CheckboxGroup
          name="materialIds"
          options={taxonomy.materials}
          defaultValues={report?.materials.map((m) => m.id) ?? []}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-foreground text-sm">Tipo de madera</Label>
        <CheckboxGroup
          name="woodTypeIds"
          options={taxonomy.woodTypes}
          defaultValues={report?.woodTypes.map((w) => w.id) ?? []}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="styleId" className="text-foreground text-sm">
            Estilo
          </Label>
          <Select name="styleId" defaultValue={report?.style?.id}>
            <SelectTrigger id="styleId">
              <SelectValue placeholder="Sin definir" />
            </SelectTrigger>
            <SelectContent>
              {taxonomy.styles.map((style) => (
                <SelectItem key={style.id} value={style.id}>
                  {style.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <FormField
          label="Década"
          name="decade"
          type="number"
          defaultValue={report?.decade ?? request.estimatedDecade ?? undefined}
        />

        <div className="flex flex-col gap-2">
          <Label htmlFor="condition" className="text-foreground text-sm">
            Estado
          </Label>
          <Select name="condition" defaultValue={report?.condition ?? undefined}>
            <SelectTrigger id="condition">
              <SelectValue placeholder="Sin definir" />
            </SelectTrigger>
            <SelectContent>
              {CONDITION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="designerId" className="text-foreground text-sm">
            Diseñador
          </Label>
          <Select name="designerId" defaultValue={report?.designer?.id}>
            <SelectTrigger id="designerId">
              <SelectValue placeholder="Sin definir" />
            </SelectTrigger>
            <SelectContent>
              {taxonomy.designers.map((designer) => (
                <SelectItem key={designer.id} value={designer.id}>
                  {designer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="manufacturerId" className="text-foreground text-sm">
            Fabricante
          </Label>
          <Select name="manufacturerId" defaultValue={report?.manufacturer?.id}>
            <SelectTrigger id="manufacturerId">
              <SelectValue placeholder="Sin definir" />
            </SelectTrigger>
            <SelectContent>
              {taxonomy.manufacturers.map((manufacturer) => (
                <SelectItem key={manufacturer.id} value={manufacturer.id}>
                  {manufacturer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="observations" className="text-foreground text-sm">
          Observaciones
        </Label>
        <Textarea
          id="observations"
          name="observations"
          rows={3}
          defaultValue={report?.observations ?? ""}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="warnings" className="text-foreground text-sm">
          Advertencias
        </Label>
        <Textarea
          id="warnings"
          name="warnings"
          rows={3}
          defaultValue={report?.warnings ?? ""}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          label="Valor estimado — mínimo"
          name="estimatedValueMin"
          type="number"
          required
          defaultValue={report?.estimatedValueMin ?? undefined}
        />
        <FormField
          label="Valor estimado — máximo"
          name="estimatedValueMax"
          type="number"
          required
          defaultValue={report?.estimatedValueMax ?? undefined}
        />
        <FormField
          label="Venta rápida"
          name="quickSaleValue"
          type="number"
          defaultValue={report?.quickSaleValue ?? undefined}
        />
        <FormField
          label="Venta ideal"
          name="idealSaleValue"
          type="number"
          defaultValue={report?.idealSaleValue ?? undefined}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          label="Tiempo estimado de venta"
          name="estimatedSaleTime"
          placeholder="2-4 semanas"
          defaultValue={report?.estimatedSaleTime ?? ""}
        />
        <FormField
          label="Nivel de confianza (0-100)"
          name="confidenceLevel"
          type="number"
          min={0}
          max={100}
          defaultValue={report?.confidenceLevel ?? undefined}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="tips" className="text-foreground text-sm">
          Consejos
        </Label>
        <Textarea id="tips" name="tips" rows={3} defaultValue={report?.tips ?? ""} />
      </div>

      <div>
        <Button type="submit" disabled={pending}>
          {pending
            ? "Guardando…"
            : report
              ? "Actualizar informe"
              : "Generar informe"}
        </Button>
      </div>
    </form>
  );
}
