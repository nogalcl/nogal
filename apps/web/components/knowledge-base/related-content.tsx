import Link from "next/link";
import type { TaxonomyRef } from "@/lib/api/types";

interface RelatedGroup {
  label: string;
  basePath: string;
  items?: TaxonomyRef[];
}

/** Enlaces cruzados automáticos (piezas ya se muestran en la grilla) —
 * diseñadores, materiales, fabricantes o estilos que aparecen junto a esta
 * ficha en el catálogo. Ver taxonomy-related.query.ts en el backend. */
export function RelatedContent({
  groups,
  valuationMentionCount,
}: {
  groups: RelatedGroup[];
  valuationMentionCount?: number;
}) {
  const visibleGroups = groups.filter((group) => group.items && group.items.length > 0);
  if (visibleGroups.length === 0 && !valuationMentionCount) return null;

  return (
    <div className="border-border mt-16 border-t pt-10">
      <h2 className="text-foreground font-serif text-2xl">Contenido relacionado</h2>

      {typeof valuationMentionCount === "number" && valuationMentionCount > 0 ? (
        <p className="text-muted-foreground mt-4 text-sm">
          Identificado en {valuationMentionCount}{" "}
          {valuationMentionCount === 1
            ? "informe de Valoración Express"
            : "informes de Valoración Express"}
          .
        </p>
      ) : null}

      <div className="mt-6 grid gap-8 sm:grid-cols-2">
        {visibleGroups.map((group) => (
          <div key={group.label}>
            <p className="text-foreground text-sm">{group.label}</p>
            <ul className="mt-3 flex flex-col gap-2">
              {group.items!.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`${group.basePath}/${item.slug}`}
                    className="text-muted-foreground hover:text-foreground text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
