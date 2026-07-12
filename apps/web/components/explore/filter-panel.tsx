import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TaxonomyOptions } from "@/lib/api/taxonomy";
import type { ExploreSearchParams } from "@/lib/explore/search-params";
import { CONDITION_OPTIONS } from "@/lib/furniture/constants";
import { FilterLinkGroup } from "./filter-link-group";
import { HiddenParams } from "./hidden-params";

const AVAILABILITY_OPTIONS = [
  { value: "disponible", label: "Disponible" },
  { value: "reservada", label: "Reservada" },
];

const ORIGINALITY_URL_OPTIONS = [
  { value: "original", label: "Original de época" },
  { value: "reproduccion", label: "Reproducción" },
];

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

interface FilterPanelProps {
  basePath: string;
  params: ExploreSearchParams;
  taxonomy: TaxonomyOptions;
  locations: string[];
  /**
   * Facetas a ocultar porque la propia página ya las fija (p. ej. la página
   * de un diseñador no necesita mostrar "Diseñador" como filtro conmutable).
   */
  hiddenFacets?: string[];
}

export function FilterPanel({
  basePath,
  params,
  taxonomy,
  locations,
  hiddenFacets = [],
}: FilterPanelProps) {
  const hasActiveFilters = Object.keys(params).some(
    (key) => key !== "orden" && key !== "pagina" && params[key] !== undefined,
  );
  const isHidden = (facet: string) => hiddenFacets.includes(facet);

  return (
    <div className="flex flex-col gap-10">
      {hasActiveFilters ? (
        <a
          href={basePath}
          className="text-muted-foreground hover:text-foreground text-sm underline underline-offset-4"
        >
          Limpiar filtros
        </a>
      ) : null}

      {!isHidden("categoria") ? (
        <FilterLinkGroup
          legend="Categoría"
          paramKey="categoria"
          activeValues={toArray(params.categoria)}
          options={taxonomy.categories.map((c) => ({
            value: c.slug,
            label: c.name,
          }))}
          basePath={basePath}
          currentParams={params}
        />
      ) : null}

      {!isHidden("material") ? (
        <FilterLinkGroup
          legend="Material"
          paramKey="material"
          activeValues={toArray(params.material)}
          options={taxonomy.materials.map((m) => ({
            value: m.slug,
            label: m.name,
          }))}
          basePath={basePath}
          currentParams={params}
        />
      ) : null}

      {!isHidden("madera") ? (
        <FilterLinkGroup
          legend="Tipo de madera"
          paramKey="madera"
          activeValues={toArray(params.madera)}
          options={taxonomy.woodTypes.map((w) => ({
            value: w.slug,
            label: w.name,
          }))}
          basePath={basePath}
          currentParams={params}
        />
      ) : null}

      {!isHidden("estilo") ? (
        <FilterLinkGroup
          legend="Estilo"
          paramKey="estilo"
          activeValues={toArray(params.estilo)}
          options={taxonomy.styles.map((s) => ({
            value: s.slug,
            label: s.name,
          }))}
          basePath={basePath}
          currentParams={params}
        />
      ) : null}

      {!isHidden("disenador") ? (
        <FilterLinkGroup
          legend="Diseñador"
          paramKey="disenador"
          activeValues={toArray(params.disenador)}
          options={taxonomy.designers.map((d) => ({
            value: d.slug,
            label: d.name,
          }))}
          basePath={basePath}
          currentParams={params}
        />
      ) : null}

      {!isHidden("fabricante") ? (
        <FilterLinkGroup
          legend="Fabricante"
          paramKey="fabricante"
          activeValues={toArray(params.fabricante)}
          options={taxonomy.manufacturers.map((m) => ({
            value: m.slug,
            label: m.name,
          }))}
          basePath={basePath}
          currentParams={params}
        />
      ) : null}

      {!isHidden("pais") ? (
        <FilterLinkGroup
          legend="País de origen"
          paramKey="pais"
          activeValues={toArray(params.pais)}
          options={taxonomy.countries.map((c) => ({
            value: c.isoCode.toLowerCase(),
            label: c.name,
          }))}
          basePath={basePath}
          currentParams={params}
        />
      ) : null}

      <FilterLinkGroup
        legend="Estado de conservación"
        paramKey="estado"
        activeValues={toArray(params.estado)}
        options={CONDITION_OPTIONS.map((o) => ({
          value: o.value.toLowerCase(),
          label: o.label,
        }))}
        basePath={basePath}
        currentParams={params}
      />

      <FilterLinkGroup
        legend="Originalidad"
        paramKey="originalidad"
        activeValues={toArray(params.originalidad)}
        options={ORIGINALITY_URL_OPTIONS}
        basePath={basePath}
        currentParams={params}
      />

      <FilterLinkGroup
        legend="Disponibilidad"
        paramKey="disponibilidad"
        activeValues={toArray(params.disponibilidad)}
        options={AVAILABILITY_OPTIONS}
        basePath={basePath}
        currentParams={params}
      />

      {locations.length > 0 ? (
        <FilterLinkGroup
          legend="Ciudad"
          paramKey="ciudad"
          activeValues={toArray(params.ciudad)}
          options={locations.map((city) => ({ value: city, label: city }))}
          basePath={basePath}
          currentParams={params}
        />
      ) : null}

      <fieldset className="flex flex-col gap-3">
        <legend className="text-foreground text-sm">Precio (CLP)</legend>
        <form method="GET" action={basePath} className="flex items-end gap-3">
          <HiddenParams
            params={params}
            exclude={["precio_min", "precio_max", "pagina"]}
          />
          <div className="flex flex-col gap-1">
            <Label
              htmlFor="precio_min"
              className="text-muted-foreground text-xs"
            >
              Mínimo
            </Label>
            <Input
              id="precio_min"
              name="precio_min"
              type="number"
              min={0}
              defaultValue={params.precio_min as string}
              className="w-24"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label
              htmlFor="precio_max"
              className="text-muted-foreground text-xs"
            >
              Máximo
            </Label>
            <Input
              id="precio_max"
              name="precio_max"
              type="number"
              min={0}
              defaultValue={params.precio_max as string}
              className="w-24"
            />
          </div>
          <Button type="submit" variant="outline" size="sm">
            Aplicar
          </Button>
        </form>
      </fieldset>
    </div>
  );
}
