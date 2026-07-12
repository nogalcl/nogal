import { Container } from "@/components/layout/container";
import { ExploreGridSkeleton } from "@/components/explore/explore-grid-skeleton";

export default function Loading() {
  return (
    <Container className="py-16">
      <div className="bg-muted h-8 w-40 animate-pulse" />
      <div className="bg-muted mt-4 h-10 w-72 animate-pulse" />
      <div className="mt-16">
        <ExploreGridSkeleton />
      </div>
    </Container>
  );
}
