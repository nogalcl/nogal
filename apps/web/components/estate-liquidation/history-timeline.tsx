import type { EstateLiquidationHistoryEntry } from "@/lib/api/types";

function formatTimestamp(date: string): string {
  return new Date(date).toLocaleString("es-CL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function HistoryTimeline({
  entries,
}: {
  entries: EstateLiquidationHistoryEntry[];
}) {
  if (entries.length === 0) {
    return <p className="text-muted-foreground text-sm">Sin actividad todavía.</p>;
  }

  return (
    <ol className="flex flex-col gap-3">
      {entries.map((entry) => (
        <li key={entry.id} className="text-sm">
          <span className="text-muted-foreground">
            {formatTimestamp(entry.createdAt)}
          </span>{" "}
          <span className="text-foreground">{entry.description}</span>
          {entry.actorName ? (
            <span className="text-muted-foreground"> — {entry.actorName}</span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
