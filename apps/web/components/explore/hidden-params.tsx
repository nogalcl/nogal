import type { ExploreSearchParams } from "@/lib/explore/search-params";

/** Preserva los filtros activos como campos ocultos en un <form method="GET">. */
export function HiddenParams({
  params,
  exclude = [],
}: {
  params: ExploreSearchParams;
  exclude?: string[];
}) {
  return (
    <>
      {Object.entries(params).flatMap(([key, value]) => {
        if (exclude.includes(key) || value === undefined) return [];
        const values = Array.isArray(value) ? value : [value];
        return values.map((v, index) => (
          <input key={`${key}-${index}`} type="hidden" name={key} value={v} />
        ));
      })}
    </>
  );
}
