import { PieceCardSkeleton } from "./piece-card-skeleton";

export function ExploreGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <PieceCardSkeleton key={i} />
      ))}
    </div>
  );
}
