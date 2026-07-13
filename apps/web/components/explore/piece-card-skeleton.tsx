import { cn } from "@/lib/utils";

export function PieceCardSkeleton({ featured = false }: { featured?: boolean }) {
  return (
    <div
      className={cn("flex animate-pulse flex-col gap-3", featured ? "col-span-2" : null)}
    >
      <div
        className={cn(
          "bg-muted w-full",
          featured ? "aspect-16/10" : "aspect-4/5",
        )}
      />
      <div className="flex flex-col gap-2">
        <div className="bg-muted h-4 w-3/4" />
        <div className="bg-muted h-3 w-1/2" />
        <div className="bg-muted h-3 w-1/3" />
      </div>
    </div>
  );
}
