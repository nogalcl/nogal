import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { AdminNav } from "@/components/admin/admin-nav";
import { UserRowActions } from "@/components/admin/user-row-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { requireStaff } from "@/lib/auth/require-staff";
import { fetchAdminUsers } from "@/lib/api/admin";

export const metadata: Metadata = { title: "Usuarios — Administración" };

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const { accessToken } = await requireStaff(["ADMIN"], "/admin/usuarios");
  const { q } = await searchParams;
  const users = await fetchAdminUsers(accessToken, q);

  return (
    <Container className="py-16">
      <p className="text-muted-foreground text-sm uppercase tracking-widest">
        Administración
      </p>
      <h1 className="text-foreground mt-3 font-serif text-4xl">Usuarios</h1>

      <div className="mt-10">
        <AdminNav current="/admin/usuarios" />
      </div>

      <form method="GET" className="mt-10 flex max-w-sm items-center gap-3">
        <Input name="q" placeholder="Buscar por nombre, usuario o correo" defaultValue={q} />
        <Button type="submit" variant="outline">
          Buscar
        </Button>
      </form>

      <div className="border-border mt-8 flex flex-col divide-y border-t">
        {users.map((user) => (
          <div key={user.id} className="flex items-center gap-4 py-4">
            <div className="min-w-0 flex-1">
              <p className="text-foreground text-sm">
                {user.profile
                  ? `${user.profile.firstName} ${user.profile.lastName}`
                  : user.email}
                {user.deletedAt ? (
                  <span className="text-destructive ml-2 text-xs uppercase tracking-widest">
                    Suspendido
                  </span>
                ) : null}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {user.email}
                {user.profile ? ` · @${user.profile.username}` : ""}
              </p>
            </div>
            <UserRowActions
              userId={user.id}
              role={user.role}
              isSuspended={Boolean(user.deletedAt)}
            />
          </div>
        ))}
      </div>
    </Container>
  );
}
