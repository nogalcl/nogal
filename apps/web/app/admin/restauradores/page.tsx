import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { AdminNav } from "@/components/admin/admin-nav";
import { RestorerActiveToggle } from "@/components/admin/restorer-active-toggle";
import { requireStaff } from "@/lib/auth/require-staff";
import { fetchRestorers } from "@/lib/api/admin";

export const metadata: Metadata = { title: "Restauradores — Administración" };

export default async function AdminRestorersPage() {
  const { accessToken } = await requireStaff(
    ["MODERATOR", "ADMIN"],
    "/admin/restauradores",
  );
  const restorers = await fetchRestorers(accessToken);

  return (
    <Container className="py-16">
      <p className="text-muted-foreground text-sm uppercase tracking-widest">
        Administración
      </p>
      <h1 className="text-foreground mt-3 font-serif text-4xl">
        Restauradores
      </h1>

      <div className="mt-10">
        <AdminNav current="/admin/restauradores" />
      </div>

      <div className="mt-10">
        <Link
          href="/admin/restauradores/nuevo"
          className="text-foreground text-sm hover:underline"
        >
          Agregar restaurador
        </Link>
      </div>

      {restorers.length === 0 ? (
        <p className="text-muted-foreground mt-10 text-sm">
          Todavía no hay restauradores en el directorio.
        </p>
      ) : (
        <div className="border-border mt-6 flex flex-col divide-y border-t">
          {restorers.map((restorer) => (
            <div key={restorer.id} className="flex items-center gap-4 py-5">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/restauradores/${restorer.id}/editar`}
                  className="text-foreground text-sm hover:underline"
                >
                  {restorer.name}
                </Link>
                <p className="text-muted-foreground mt-1 text-sm">
                  {[restorer.specialty, restorer.city, restorer.phone]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <span className="text-muted-foreground shrink-0 text-xs uppercase tracking-widest">
                {restorer.isActive ? "Activo" : "Inactivo"}
              </span>
              <RestorerActiveToggle
                id={restorer.id}
                isActive={restorer.isActive}
              />
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
