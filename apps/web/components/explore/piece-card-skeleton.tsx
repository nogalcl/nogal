export function PieceCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-3">
      <div className="aspect-4/5 border-border bg-muted w-full border" />
      <div className="flex flex-col gap-2">
        <div className="bg-muted h-4 w-3/4" />
        <div className="bg-muted h-3 w-1/2" />
        <div className="bg-muted h-3 w-1/3" />
      </div>
    </div>
  );
}
