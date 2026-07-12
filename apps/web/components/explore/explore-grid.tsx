import type { FurniturePreview } from "@/lib/api/types";
import { EmptyState } from "./empty-state";
import { PieceCard } from "./piece-card";

export function ExploreGrid({
  items,
  emptyTitle,
  emptyDescription,
}: {
  items: FurniturePreview[];
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (items.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((piece) => (
        <PieceCard key={piece.id} piece={piece} />
      ))}
    </div>
  );
}
