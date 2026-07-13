"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { TaxonomyOptions } from "@/lib/api/taxonomy";
import type { Furniture } from "@/lib/api/types";
import {
  createFurnitureAction,
  updateFurnitureAction,
  uploadFurnitureImageAction,
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
import { PhotoPicker } from "./photo-picker";
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
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

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

  const categoryId = watch("categoryId");
  // categoryId no se llena con un <input> nativo (se controla a mano desde
  // los dos SelectField de abajo vía setValue), así que sin este register
  // explícito react-hook-form nunca lo valida y el formulario deja mandar
  // la pieza sin categoría — el backend la rechaza con un genérico "Bad
  // Request Exception" que no le dice nada al vendedor.
  register("categoryId", { required: "Selecciona una categoría." });

  async function onSubmit(values: FurnitureFormValues) {
    setError(null);
    setIsSubmitting(true);

    if (isEditing) {
      const result = await updateFurnitureAction(furniture!.id, values);
      setIsSubmitting(false);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
      return;
    }

    const created = await createFurnitureAction(values);
    if (created.error || !created.id) {
      setIsSubmitting(false);
      setError(created.error ?? "No se pudo crear la pieza.");
      return;
    }

    // Con la pieza ya creada subimos de una las fotos elegidas antes de
    // guardar, para que el vendedor no tenga que volver a una segunda
    // pantalla solo para añadirlas.
    for (let i = 0; i < photoFiles.length; i++) {
      setUploadProgress(
        `Subiendo fotografías (${i + 1}/${photoFiles.length})…`,
      );
      const formData = new FormData();
      formData.append("file", photoFiles[i]);
      await uploadFurnitureImageAction(created.id, formData);
    }

    setUploadProgress(null);
    setIsSubmitting(false);
    router.push(`/vender/piezas/${created.id}/editar`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-16">
      {error ? (
        <p className="border-destructive/30 bg-destructive/10 text-destructive border px-4 py-3 text-sm">
          {error}
        </p>
      ) : null}

      {/* Fotografías */}
      <section className="flex flex-col gap-6">
        <h2 className="text-foreground font-serif text-2xl">Fotografías</h2>
        {furniture ? (
          <ImageManager
            furnitureId={furniture.id}
            initialImages={furniture.images}
          />
        ) : (
          <PhotoPicker onFilesChange={setPhotoFiles} />
        )}
      </section>

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

        <SelectField
          label="Categoría *"
          value={categoryId}
          onChange={(value) =>
            setValue("categoryId", value, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          options={taxonomy.categories.map((c) => ({
            value: c.id,
            label: c.name,
          }))}
        />
        {errors.categoryId ? (
          <p className="text-destructive text-xs">
            {errors.categoryId.message}
          </p>
        ) : null}
      </section>

      {/* Precio y estado */}
      <section className="flex flex-col gap-6">
        <h2 className="text-foreground font-serif text-2xl">
          Precio y estado
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
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
        {errors.price ? (
          <p className="text-destructive text-xs">{errors.price.message}</p>
        ) : null}
      </section>

      {/* Detalles adicionales (opcional) */}
      <section className="flex flex-col gap-10">
        <button
          type="button"
          onClick={() => setShowAdvanced((prev) => !prev)}
          className="text-foreground self-start text-sm underline underline-offset-4"
        >
          {showAdvanced
            ? "Ocultar detalles adicionales"
            : "Añadir detalles adicionales (opcional)"}
        </button>

        {showAdvanced ? (
          <>
            <div className="flex flex-col gap-6">
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
            </div>

            <div className="flex flex-col gap-6">
              <h2 className="text-foreground font-serif text-2xl">
                Diseño y origen
              </h2>
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
            </div>

            <div className="flex flex-col gap-6">
              <h2 className="text-foreground font-serif text-2xl">Medidas</h2>
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
            </div>

            <div className="flex flex-col gap-6">
              <h2 className="text-foreground font-serif text-2xl">
                Moneda y tipo de precio
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
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
            </div>

            <div className="flex flex-col gap-6">
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
            </div>

            <div className="flex flex-col gap-6">
              <h2 className="text-foreground font-serif text-2xl">
                Observaciones
              </h2>
              <div className="flex flex-col gap-2">
                <label className="text-foreground text-sm">
                  Notas sobre el estado de conservación
                </label>
                <Textarea rows={4} {...register("conditionNotes")} />
              </div>
            </div>
          </>
        ) : null}
      </section>

      <div className="border-border flex flex-col gap-3 border-t pt-8">
        {uploadProgress ? (
          <p className="text-muted-foreground text-sm">{uploadProgress}</p>
        ) : null}
        <Button type="submit" disabled={isSubmitting} className="self-start">
          {isSubmitting
            ? "Guardando…"
            : isEditing
              ? "Guardar cambios"
              : "Publicar pieza"}
        </Button>
      </div>
    </form>
  );
}
