import { STATUS_LABELS } from "@/lib/furniture/constants";
import type { FurnitureStatus } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export function StatusLabel({
  status,
  className,
}: {
  status: FurnitureStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "text-muted-foreground text-xs uppercase tracking-widest",
        className,
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
