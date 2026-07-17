import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AvatarUpload } from "@/components/account/avatar-upload";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { fetchCurrentUser } from "@/lib/api/auth";
import { logoutAction } from "@/lib/auth/actions";
import { getAccessToken } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Mi cuenta" };

const QUICK_LINKS = [
  { href: "/vender/piezas", label: "Mis piezas" },
  { href: "/favoritos", label: "Favoritos" },
  { href: "/colecciones", label: "Colecciones" },
  { href: "/mensajes", label: "Mensajes" },
  { href: "/notificaciones", label: "Notificaciones" },
  { href: "/valoracion-express/solicitudes", label: "Mis valoraciones" },
] as const;

export default async function AccountPage() {
  const accessToken = await getAccessToken();
  const user = accessToken ? await fetchCurrentUser(accessToken) : null;

  if (!user) {
    redirect("/iniciar-sesion");
  }

  return (
    <Container className="py-20">
      <div className="max-w-lg">
        <p className="text-muted-foreground text-sm uppercase tracking-widest">
          Mi cuenta
        </p>
        <h1 className="text-foreground mt-3 text-3xl">
          {user.profile
            ? `${user.profile.firstName} ${user.profile.lastName}`
            : user.email}
        </h1>

        {user.profile ? (
          <div className="mt-8">
            <AvatarUpload
              name={`${user.profile.firstName} ${user.profile.lastName}`}
              initialAvatarUrl={user.profile.avatarUrl}
            />
          </div>
        ) : null}

        <dl className="border-border mt-10 flex flex-col gap-4 border-t pt-8 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Usuario</dt>
            <dd className="text-foreground">{user.profile?.username}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Correo</dt>
            <dd className="text-foreground">{user.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Correo verificado</dt>
            <dd className="text-foreground">
              {user.emailVerified ? "Sí" : "No"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Rol</dt>
            <dd className="text-foreground">{user.role}</dd>
          </div>
        </dl>

        <div className="border-border mt-10 flex flex-col gap-3 border-t pt-8">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-foreground text-sm hover:underline"
            >
              {link.label}
            </Link>
          ))}
          {user.role === "MODERATOR" || user.role === "ADMIN" ? (
            <>
              <Link
                href="/valoracion-express/panel"
                className="text-foreground text-sm hover:underline"
              >
                Panel experto
              </Link>
              <Link
                href="/admin"
                className="text-foreground text-sm hover:underline"
              >
                Panel de administración
              </Link>
            </>
          ) : null}
        </div>

        <form action={logoutAction} className="mt-10">
          <Button type="submit" variant="outline">
            Cerrar sesión
          </Button>
        </form>
      </div>
    </Container>
  );
}
