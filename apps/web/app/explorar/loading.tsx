import { Container } from "@/components/layout/container";
import { ExploreGridSkeleton } from "@/components/explore/explore-grid-skeleton";

export default function Loading() {
  return (
    <Container className="py-16">
      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm uppercase tracking-widest">
          Catálogo
        </p>
        <h1 className="text-foreground font-serif text-4xl">Explorar piezas</h1>
      </div>
      <div className="mt-20">
        <ExploreGridSkeleton />
      </div>
    </Container>
  );
}
