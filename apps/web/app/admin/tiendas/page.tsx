import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { AdminNav } from "@/components/admin/admin-nav";
import { StoreVerifyButton } from "@/components/admin/store-verify-button";
import { requireStaff } from "@/lib/auth/require-staff";
import { fetchStoresForAdmin } from "@/lib/api/admin";

export const metadata: Metadata = { title: "Tiendas — Administración" };

export default async function AdminStoresPage() {
  const { accessToken } = await requireStaff(["MODERATOR", "ADMIN"], "/admin/tiendas");
  const stores = await fetchStoresForAdmin(accessToken);

  return (
    <Container className="py-16">
      <p className="text-muted-foreground text-sm uppercase tracking-widest">
        Administración
      </p>
      <h1 className="text-foreground mt-3 font-serif text-4xl">Tiendas</h1>

      <div className="mt-10">
        <AdminNav current="/admin/tiendas" />
      </div>

      <div className="border-border mt-10 flex flex-col divide-y border-t">
        {stores.map((store) => (
          <div key={store.id} className="flex items-center gap-4 py-5">
            <div className="min-w-0 flex-1">
              <Link
                href={`/tiendas/${store.slug}`}
                target="_blank"
                className="text-foreground text-sm hover:underline"
              >
                {store.name}
              </Link>
              <p className="text-muted-foreground mt-1 text-sm">
                {store.pieceCount} piezas · {store.followersCount} seguidores
                {store.ownerUsername ? ` · @${store.ownerUsername}` : ""}
              </p>
            </div>
            <span className="text-muted-foreground shrink-0 text-xs uppercase tracking-widest">
              {store.isVerified ? "Verificada" : "Sin verificar"}
            </span>
            <StoreVerifyButton id={store.id} isVerified={store.isVerified} />
          </div>
        ))}
      </div>
    </Container>
  );
}
