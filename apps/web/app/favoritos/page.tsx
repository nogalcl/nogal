import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/container";
import { ExploreGrid } from "@/components/explore/explore-grid";
import { fetchMyFavorites } from "@/lib/api/favorites";
import { getAccessToken } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Favoritos" };

export default async function FavoritesPage() {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    redirect("/iniciar-sesion?next=/favoritos");
  }

  const favorites = await fetchMyFavorites(accessToken);

  return (
    <Container className="py-16">
      <p className="text-muted-foreground text-sm uppercase tracking-widest">
        Guardado
      </p>
      <h1 className="text-foreground mt-3 font-serif text-4xl">Favoritos</h1>
      <p className="text-muted-foreground mt-4 text-sm">
        {favorites.total} {favorites.total === 1 ? "pieza guardada" : "piezas guardadas"}
      </p>

      <div className="mt-12">
        <ExploreGrid
          items={favorites.items}
          emptyTitle="Todavía no guardaste ninguna pieza"
          emptyDescription="Explora el catálogo y guarda las piezas que te interesen."
        />
      </div>
    </Container>
  );
}
