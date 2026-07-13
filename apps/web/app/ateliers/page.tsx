import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { fetchStores } from "@/lib/api/stores";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Ateliers",
  description:
    "Vendedores curados de mobiliario de diseño, antigüedades y piezas de colección en Nogal.",
  alternates: { canonical: `${siteConfig.url}/ateliers` },
};

export default async function AteliersPage() {
  const stores = await fetchStores();

  return (
    <Container className="py-16">
      <p className="text-muted-foreground text-sm uppercase tracking-widest">
        Nogal
      </p>
      <h1 className="text-foreground mt-3 font-serif text-4xl">Ateliers</h1>
      <p className="text-muted-foreground mt-4 max-w-2xl text-base">
        Vendedores curados — cada atelier reúne piezas documentadas, con
        procedencia verificada cuando corresponde.
      </p>

      {stores.length === 0 ? (
        <p className="text-muted-foreground mt-16 text-sm">
          Todavía no hay ateliers publicados. Vuelve pronto.
        </p>
      ) : (
        <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => {
            const location = [store.locationCity, store.locationRegion]
              .filter(Boolean)
              .join(", ");

            return (
              <Link
                key={store.id}
                href={`/tiendas/${store.slug}`}
                className="group flex flex-col gap-4"
              >
                <div className="bg-muted relative aspect-4/3 w-full overflow-hidden">
                  {store.bannerUrl ? (
                    <Image
                      src={store.bannerUrl}
                      alt={store.name}
                      fill
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  ) : null}
                </div>

                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-widest">
                    {store.isVerified ? "Vendedor verificado" : "Atelier"}
                    {location ? ` · ${location}` : ""}
                  </p>
                  <h3 className="text-foreground mt-1 font-serif text-xl">
                    {store.name}
                  </h3>
                  {store.bio ? (
                    <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
                      {store.bio}
                    </p>
                  ) : null}
                  <p className="text-muted-foreground mt-2 text-sm">
                    {store.pieceCount}{" "}
                    {store.pieceCount === 1 ? "pieza" : "piezas"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </Container>
  );
}
