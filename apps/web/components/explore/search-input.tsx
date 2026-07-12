import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ExploreSearchParams } from "@/lib/explore/search-params";
import { HiddenParams } from "./hidden-params";

export function SearchInput({
  basePath,
  params,
}: {
  basePath: string;
  params: ExploreSearchParams;
}) {
  return (
    <form
      method="GET"
      action={basePath}
      className="border-border flex items-center gap-3 border-b pb-4"
    >
      <HiddenParams params={params} exclude={["q", "pagina"]} />
      <Search className="text-muted-foreground size-4 shrink-0" aria-hidden />
      <Input
        type="search"
        name="q"
        defaultValue={(params.q as string) ?? ""}
        placeholder="Buscar por título, descripción, diseñador, material…"
        aria-label="Buscar piezas"
        className="border-none bg-transparent px-0 text-base shadow-none focus-visible:ring-0 dark:bg-transparent"
      />
      <Button type="submit" variant="outline" size="sm">
        Buscar
      </Button>
    </form>
  );
}
