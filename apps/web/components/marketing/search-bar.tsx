import Link from "next/link";
import { Search } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const suggestions = ["Sillas", "Mesas", "Iluminación", "Antigüedades"] as const;

export function SearchBar() {
  return (
    <section className="border-border bg-card border-y">
      <Container className="flex flex-col gap-4 py-10">
        <form
          action="/explorar"
          method="GET"
          className="flex items-center gap-3"
        >
          <Search
            className="text-muted-foreground size-4 shrink-0"
            aria-hidden
          />
          <Input
            type="search"
            name="q"
            placeholder="Buscar por pieza, autor, material o época…"
            aria-label="Buscar piezas"
            className="border-none bg-transparent px-0 text-base shadow-none focus-visible:ring-0 dark:bg-transparent"
          />
          <Button type="submit" variant="outline" size="sm">
            Buscar
          </Button>
        </form>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((term) => (
            <Link
              key={term}
              href={`/explorar?q=${encodeURIComponent(term)}`}
              className="border-border text-muted-foreground hover:text-foreground hover:border-foreground border px-3 py-1 text-xs transition-colors"
            >
              {term}
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
