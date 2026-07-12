import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireStaff } from "@/lib/auth/require-staff";
import { fetchRoles } from "@/lib/api/admin";

export const metadata: Metadata = { title: "Permisos — Administración" };

export default async function AdminPermissionsPage() {
  const { accessToken } = await requireStaff(["ADMIN"], "/admin/permisos");
  const roles = await fetchRoles(accessToken);

  return (
    <Container className="py-16">
      <p className="text-muted-foreground text-sm uppercase tracking-widest">
        Administración
      </p>
      <h1 className="text-foreground mt-3 font-serif text-4xl">Permisos</h1>
      <p className="text-muted-foreground mt-4 max-w-xl text-sm">
        Los permisos están definidos por rol. Para cambiar el rol de una
        persona, ve a Usuarios.
      </p>

      <div className="mt-10">
        <AdminNav current="/admin/permisos" />
      </div>

      <div className="mt-10 grid gap-8 sm:grid-cols-3">
        {roles.map((role) => (
          <div key={role.name} className="border-border border p-6">
            <p className="text-foreground font-serif text-xl">{role.name}</p>
            {role.description ? (
              <p className="text-muted-foreground mt-2 text-sm">{role.description}</p>
            ) : null}
            <ul className="mt-4 flex flex-col gap-1">
              {role.permissions.map((permission) => (
                <li key={permission} className="text-muted-foreground text-xs">
                  {permission}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Container>
  );
}
