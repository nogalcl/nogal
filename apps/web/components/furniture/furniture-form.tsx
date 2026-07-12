"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { TaxonomyOptions } from "@/lib/api/taxonomy";
import type { Furniture } from "@/lib/api/types";
import {
  createFurnitureAction,
  updateFurnitureAction,
} from "@/lib/furniture/actions";
import {
  CONDITION_OPTIONS,
  CURRENCY_OPTIONS,
  ORIGINALITY_OPTIONS,
  PRICE_TYPE_OPTIONS,
  SHIPPING_METHOD_OPTIONS,
} from "@/lib/furniture/constants";
import {
  emptyFurnitureFormValues,
  mapFurnitureToFormValues,
  type FurnitureFormValues,
} from "@/lib/furniture/types";
import { CheckboxGroup } from "./checkbox-group";
import { FormField } from "@/components/forms/form-field";
import { ImageManager } from "./image-manager";
import { SelectField } from "./select-field";

interface FurnitureFormProps {
  taxonomy: TaxonomyOptions;
  furniture?: Furniture;
}

export function FurnitureForm({ taxonomy, furniture }: FurnitureFormProps) {
  const router = useRouter();
  const isEditing = Boolean(furniture);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FurnitureFormValues>({
    defaultValues: furniture
      ? mapFurnitureToFormValues(furniture)
      : emptyFurnitureFormValues,
  });

  const topCategories = useMemo(
    () => taxonomy.categories.filter((category) => !category.parentId),
    [taxonomy.categories],
  );

  const initialTopCategoryId = useMemo(() => {
    if (!furniture) return "";
    const current = taxonomy.categories.find(
      (c) => c.id === furniture.category.id,
    );
    return current?.parentId ?? current?.id ?? "";
  }, [furniture, taxonomy.categories]);

  const [topCategoryId, setTopCategoryId] = useState(initialTopCategoryId);
  const subCategories = useMemo(
    () =>
      taxonomy.categories.filter(
        (category) => category.parentId === topCategoryId,
      ),
    [taxonomy.categories, topCategoryId],
  );

  const categoryId = watch("categoryId");

  async function onSubmit(values: FurnitureFormValues) {
    setError(null);
    setIsSubmitting(true);

    const result = isEditing
      ? await updateFurnitureAction(furniture!.id, values)
      : await createFurnitureAction(values);

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (isEditing) {
      router.refresh();
    } else if (result.id) {
      router.push(`/vender/piezas/${result.id}/editar`);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-16">
      {error ? (
        <p className="border-destructive/30 bg-destructive/10 text-destructive border px-4 py-3 text-sm">
          {error}
        </p>
      ) : null}

      {/* Información básica */}
      <section className="flex flex-col gap-6">
        <h2 className="text-foreground font-serif text-2xl">
          Información básica
        </h2>
        <FormField
          label="Título"
          {...register("title", { required: "El título es obligatorio." })}
        />
        {errors.title ? (
          <p className="text-destructive text-xs">{errors.title.message}</p>
        ) : null}

        <div className="flex flex-col gap-2">
          <label className="text-foreground text-sm">Descripción</label>
          <Textarea
            rows={6}
            {...register("description", {
              required: "La descripción es obligatoria.",
              minLength: { value: 20, message: "Al menos 20 caracteres." },
            })}
          />
          {errors.description ? (
            <p className="text-destructive text-xs">
              {errors.description.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <SelectField
            label="Categoría"
            value={topCategoryId}
            onChange={(value) => {
              setTopCategoryId(value);
              setValue("categoryId", value, { shouldDirty: true });
            }}
            options={topCategories.map((c) => ({ value: c.id, label: c.name }))}
          />
          <SelectField
            label="Subcategoría"
            value={categoryId === topCategoryId ? "" : categoryId}
            onChange={(value) => setValue("categoryId", value || topCategoryId)}
            options={subCategories.map((c) => ({ value: c.id, label: c.name }))}
            placeholder={
              subCategories.length
                ? "Selecciona una opción"
                : "Sin subcategorías"
            }
            disabled={subCategories.length === 0}
          />
        </div>
      </section>

      {/* Características y materiales */}
      <section className="flex flex-col gap-6">
        <h2 className="text-foreground font-serif text-2xl">
          Características y materiales
        </h2>
        <Controller
          control={control}
          name="materialIds"
          render={({ field }) => (
            <CheckboxGroup
              legend="Materiales"
              options={taxonomy.materials.map((m) => ({
                value: m.id,
                label: m.name,
              }))}
              values={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="woodTypeIds"
          render={({ field }) => (
            <CheckboxGroup
              legend="Tipos de madera"
              options={taxonomy.woodTypes.map((w) => ({
                value: w.id,
                label: w.name,
              }))}
              values={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <div className="grid gap-6 md:grid-cols-3">
          <Controller
            control={control}
            name="styleId"
            render={({ field }) => (
              <SelectField
                label="Estilo"
                value={field.value ?? ""}
                onChange={field.onChange}
                emptyLabel="Sin especificar"
                options={taxonomy.styles.map((s) => ({
                  value: s.id,
                  label: s.name,
                }))}
              />
            )}
          />
          <FormField label="Color" {...register("color")} />
          <Controller
            control={control}
            name="originality"
            render={({ field }) => (
              <SelectField
                label="Originalidad"
                value={field.value}
                onChange={field.onChange}
                options={ORIGINALITY_OPTIONS}
              />
            )}
          />
        </div>
      </section>

      {/* Diseño y origen */}
      <section className="flex flex-col gap-6">
        <h2 className="text-foreground font-serif text-2xl">Diseño y origen</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Controller
            control={control}
            name="designerId"
            render={({ field }) => (
              <SelectField
                label="Diseñador"
                value={field.value ?? ""}
                onChange={field.onChange}
                emptyLabel="Sin especificar"
                options={taxonomy.designers.map((d) => ({
                  value: d.id,
                  label: d.name,
                }))}
              />
            )}
          />
          <Controller
            control={control}
            name="manufacturerId"
            render={({ field }) => (
              <SelectField
                label="Fabricante"
                value={field.value ?? ""}
                onChange={field.onChange}
                emptyLabel="Sin especificar"
                options={taxonomy.manufacturers.map((m) => ({
                  value: m.id,
                  label: m.name,
                }))}
              />
            )}
          />
          <Controller
            control={control}
            name="originCountryId"
            render={({ field }) => (
              <SelectField
                label="País de origen"
                value={field.value ?? ""}
                onChange={field.onChange}
                emptyLabel="Sin especificar"
                options={taxonomy.countries.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
              />
            )}
          />
        </div>
        <div className="w-full max-w-[200px]">
          <FormField
            label="Década"
            type="number"
            {...register("decade", { valueAsNumber: true })}
          />
        </div>
      </section>

      {/* Medidas y estado */}
      <section className="flex flex-col gap-6">
        <h2 className="text-foreground font-serif text-2xl">
          Medidas y estado
        </h2>
        <div className="grid gap-6 md:grid-cols-4">
          <FormField
            label="Ancho (cm)"
            type="number"
            step="0.1"
            {...register("widthCm", { valueAsNumber: true })}
          />
          <FormField
            label="Alto (cm)"
            type="number"
            step="0.1"
            {...register("heightCm", { valueAsNumber: true })}
          />
          <FormField
            label="Profundidad (cm)"
            type="number"
            step="0.1"
            {...register("depthCm", { valueAsNumber: true })}
          />
          <FormField
            label="Peso (kg)"
            type="number"
            step="0.1"
            {...register("weightKg", { valueAsNumber: true })}
          />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Controller
            control={control}
            name="condition"
            render={({ field }) => (
              <SelectField
                label="Estado de conservación"
                value={field.value}
                onChange={field.onChange}
                options={CONDITION_OPTIONS}
              />
            )}
          />
        </div>
      </section>

      {/* Precio */}
      <section className="flex flex-col gap-6">
        <h2 className="text-foreground font-serif text-2xl">Precio</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <FormField
            label="Precio"
            type="number"
            step="0.01"
            {...register("price", {
              required: "Indica un precio.",
              valueAsNumber: true,
              min: {
                value: 0.01,
                message: "El precio debe ser mayor que cero.",
              },
            })}
          />
          <Controller
            control={control}
            name="currency"
            render={({ field }) => (
              <SelectField
                label="Moneda"
                value={field.value}
                onChange={field.onChange}
                options={CURRENCY_OPTIONS}
              />
            )}
          />
          <Controller
            control={control}
            name="priceType"
            render={({ field }) => (
              <SelectField
                label="Tipo de precio"
                value={field.value}
                onChange={field.onChange}
                options={PRICE_TYPE_OPTIONS}
              />
            )}
          />
        </div>
        {errors.price ? (
          <p className="text-destructive text-xs">{errors.price.message}</p>
        ) : null}
      </section>

      {/* Ubicación y envío */}
      <section className="flex flex-col gap-6">
        <h2 className="text-foreground font-serif text-2xl">
          Ubicación y envío
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <FormField label="Ciudad" {...register("locationCity")} />
          <FormField label="Región" {...register("locationRegion")} />
          <Controller
            control={control}
            name="locationCountryId"
            render={({ field }) => (
              <SelectField
                label="País"
                value={field.value ?? ""}
                onChange={field.onChange}
                emptyLabel="Sin especificar"
                options={taxonomy.countries.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
              />
            )}
          />
        </div>
        <Controller
          control={control}
          name="shippingMethods"
          render={({ field }) => (
            <CheckboxGroup
              legend="Métodos de envío o entrega"
              options={SHIPPING_METHOD_OPTIONS}
              values={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </section>

      {/* Fotografías */}
      <section className="flex flex-col gap-6">
        <h2 className="text-foreground font-serif text-2xl">Fotografías</h2>
        {furniture ? (
          <ImageManager
            furnitureId={furniture.id}
            initialImages={furniture.images}
          />
        ) : (
          <p className="border-border bg-card text-muted-foreground border px-4 py-4 text-sm">
            Guarda la pieza para poder añadir fotografías.
          </p>
        )}
      </section>

      {/* Observaciones */}
      <section className="flex flex-col gap-6">
        <h2 className="text-foreground font-serif text-2xl">Observaciones</h2>
        <div className="flex flex-col gap-2">
          <label className="text-foreground text-sm">
            Notas sobre el estado de conservación
          </label>
          <Textarea rows={4} {...register("conditionNotes")} />
        </div>
      </section>

      <div className="border-border flex gap-4 border-t pt-8">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Guardando…"
            : isEditing
              ? "Guardar cambios"
              : "Guardar y continuar"}
        </Button>
      </div>
    </form>
  );
}
