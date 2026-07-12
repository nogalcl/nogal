interface Spec {
  label: string;
  value: string | null | undefined;
}

export function SpecList({ specs }: { specs: Spec[] }) {
  const visible = specs.filter((spec) => Boolean(spec.value));
  if (visible.length === 0) return null;

  return (
    <dl className="divide-border border-border flex flex-col divide-y border-t text-sm">
      {visible.map((spec) => (
        <div key={spec.label} className="flex justify-between gap-6 py-3">
          <dt className="text-muted-foreground">{spec.label}</dt>
          <dd className="text-foreground text-right">{spec.value}</dd>
        </div>
      ))}
    </dl>
  );
}
