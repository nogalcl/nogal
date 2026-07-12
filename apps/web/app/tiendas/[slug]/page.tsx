import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { ExploreGrid } from "@/components/explore/explore-grid";
import { FollowButton } from "@/components/social/follow-button";
import { fetchStoreBySlug } from "@/lib/api/stores";
import { fetchStoreCollections } from "@/lib/api/collections";
import { exploreFurniture } from "@/lib/api/explore";
import { fetchPublicProfile } from "@/lib/api/profile";
import { getAccessToken } from "@/lib/auth/session";
import { siteConfig } from "@/lib/site";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const store = await fetchStoreBySlug(slug);
  if (!store) return { title: "Atelier no encontrado" };

  return {
    title: store.name,
    description:
      store.bio ?? `${store.name} — atelier de diseño en ${siteConfig.name}.`,
    alternates: { canonical: `${siteConfig.url}/tiendas/${store.slug}` },
    openGraph: store.bannerUrl ? { images: [{ url: store.bannerUrl }] } : undefined,
  };
}

const DAY_LABELS: Record<string, string> = {
  lun_vie: "Lunes a viernes",
  mar_sab: "Martes a sábado",
  lun_dom: "Todos los días",
  sabado: "Sábado",
  domingo: "Domingo",
};

export default async function StorePage({ params }: PageProps) {
  const { slug } = await params;
  const accessToken = await getAccessToken();
  const store = await fetchStoreBySlug(slug);
  if (!store) notFound();

  const [collections, pieces, ownerProfile] = await Promise.all([
    fetchStoreCollections(store.id),
    exploreFurniture({ storeId: store.id, perPage: 24 }, "RECENT"),
    store.ownerUsername
      ? fetchPublicProfile(store.ownerUsername, accessToken)
      : Promise.resolve(null),
  ]);

  const location = [store.locationCity, store.locationRegion]
    .filter(Boolean)
    .join(", ");

  return (
    <div>
      <div className="bg-muted relative h-56 w-full sm:h-72">
        {store.bannerUrl ? (
          <Image
            src={store.bannerUrl}
            alt=""
            fill
            className="object-cover"
            priority
          />
        ) : null}
      </div>

      <Container className="py-16">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-5">
            <div className="border-background bg-muted relative -mt-16 size-24 shrink-0 overflow-hidden rounded-full border-4">
              {store.logoUrl ? (
                <Image
                  src={store.logoUrl}
                  alt={store.name}
                  fill
                  className="object-cover"
                />
              ) : null}
            </div>
            <div>
              <p className="text-muted-foreground text-sm uppercase tracking-widest">
                Atelier
              </p>
              <h1 className="text-foreground mt-2 font-serif text-3xl">
                {store.name}
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                {store.isVerified ? "Vendedor verificado" : "Vendedor de Nogal"}
                {location ? ` · ${location}` : ""}
              </p>
              {store.ownerUsername ? (
                <Link
                  href={`/perfil/${store.ownerUsername}`}
                  className="text-foreground mt-2 inline-block text-sm hover:underline"
                >
                  Ver perfil del vendedor
                </Link>
              ) : null}
            </div>
          </div>

          {ownerProfile && !ownerProfile.isOwnProfile ? (
            <FollowButton
              userId={store.ownerId}
              profilePath={`/tiendas/${store.slug}`}
              initialIsFollowing={ownerProfile.isFollowedByViewer}
              isAuthenticated={Boolean(accessToken)}
            />
          ) : null}
        </div>

        {store.bio ? (
          <p className="text-muted-foreground mt-8 max-w-2xl text-base leading-relaxed">
            {store.bio}
          </p>
        ) : null}

        <dl className="border-border mt-10 grid grid-cols-2 gap-6 border-y py-8 sm:grid-cols-4">
          <div>
            <dt className="text-muted-foreground text-xs uppercase tracking-widest">
              Piezas
            </dt>
            <dd className="text-foreground mt-2 font-serif text-2xl">
              {store.pieceCount}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs uppercase tracking-widest">
              Seguidores
            </dt>
            <dd className="text-foreground mt-2 font-serif text-2xl">
              {store.followersCount}
            </dd>
          </div>
          {store.websiteUrl ? (
            <div>
              <dt className="text-muted-foreground text-xs uppercase tracking-widest">
                Sitio web
              </dt>
              <dd className="mt-2 text-sm">
                <a
                  href={store.websiteUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-foreground hover:underline"
                >
                  {store.websiteUrl.replace(/^https?:\/\//, "")}
                </a>
              </dd>
            </div>
          ) : null}
          {store.socialLinks.length > 0 ? (
            <div>
              <dt className="text-muted-foreground text-xs uppercase tracking-widest">
                Redes
              </dt>
              <dd className="mt-2 flex flex-col gap-1 text-sm">
                {store.socialLinks.map((link) => (
                  <a
                    key={link.key}
                    href={link.value}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-foreground capitalize hover:underline"
                  >
                    {link.key}
                  </a>
                ))}
              </dd>
            </div>
          ) : null}
        </dl>

        {store.schedule.length > 0 ? (
          <div className="mt-8">
            <p className="text-foreground text-sm">Horario</p>
            <dl className="mt-3 flex flex-col gap-1">
              {store.schedule.map((entry) => (
                <div key={entry.key} className="flex gap-3 text-sm">
                  <dt className="text-muted-foreground w-40">
                    {DAY_LABELS[entry.key] ?? entry.key}
                  </dt>
                  <dd className="text-foreground">{entry.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}

        {collections.length > 0 ? (
          <div className="mt-16">
            <h2 className="text-foreground font-serif text-2xl">Colecciones</h2>
            <div className="mt-8 flex flex-col gap-12">
              {collections.map((collection) => (
                <div key={collection.id}>
                  <p className="text-foreground text-sm">
                    {collection.name}
                    <span className="text-muted-foreground ml-2 text-xs">
                      {collection.itemCount} piezas
                    </span>
                  </p>
                  <div className="mt-4">
                    <ExploreGrid items={collection.items} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-16">
          <h2 className="text-foreground font-serif text-2xl">
            Todas las piezas
          </h2>
          <div className="mt-8">
            <ExploreGrid
              items={pieces.items}
              emptyTitle="Sin piezas publicadas todavía"
              emptyDescription="Cuando esta tienda publique piezas, aparecerán aquí."
            />
          </div>
        </div>
      </Container>
    </div>
  );
}
