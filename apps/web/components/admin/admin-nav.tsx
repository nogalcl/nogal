import Link from "next/link";

const SECTIONS = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/moderacion", label: "Moderación" },
  { href: "/admin/tiendas", label: "Tiendas" },
  { href: "/admin/reportes", label: "Reportes" },
  { href: "/valoracion-express/panel", label: "Valoraciones" },
  { href: "/admin/usuarios", label: "Usuarios" },
  { href: "/admin/logs", label: "Logs" },
  { href: "/admin/permisos", label: "Permisos" },
] as const;

export function AdminNav({ current }: { current: string }) {
  return (
    <nav className="flex flex-wrap gap-x-8 gap-y-3">
      {SECTIONS.map((section) => (
        <Link
          key={section.href}
          href={section.href}
          className={
            section.href === current
              ? "text-foreground text-sm underline underline-offset-4"
              : "text-muted-foreground hover:text-foreground text-sm"
          }
        >
          {section.label}
        </Link>
      ))}
    </nav>
  );
}
