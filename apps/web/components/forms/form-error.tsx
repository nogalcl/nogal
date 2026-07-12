export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="border-destructive/30 bg-destructive/10 text-destructive border px-4 py-3 text-sm">
      {message}
    </p>
  );
}
