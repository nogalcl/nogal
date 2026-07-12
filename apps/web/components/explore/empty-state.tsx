export function EmptyState({
  title = "No encontramos piezas con estos filtros",
  description = "Prueba a quitar alguno de los filtros activos o a ampliar la búsqueda.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="border-border bg-card border px-8 py-20 text-center">
      <p className="text-foreground font-serif text-2xl">{title}</p>
      <p className="text-muted-foreground mt-3 text-sm">{description}</p>
    </div>
  );
}
