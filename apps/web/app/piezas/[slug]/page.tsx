import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { PieceGallery } from "@/components/furniture/piece-gallery";
import { SpecList } from "@/components/furniture/spec-list";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { ContactSellerButton } from "@/components/messaging/contact-seller-button";
import { AddToCollectionMenu } from "@/components/collections/add-to-collection-menu";
import { fetchFurnitureBySlug } from "@/lib/api/furniture";
import { fetchIsFavorited } from "@/lib/api/favorites";
import { fetchMyCollections } from "@/lib/api/collections";
import { CONDITION_LABELS } from "@/lib/furniture/constants";
import { formatPrice } from "@/lib/format/currency";
import { getAccessToken } from "@/lib/auth/session";
import { siteConfig } from "@/lib/site";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const accessToken = await getAccessToken();
  const piece = await fetchFurnitureBySlug(slug, accessToken);
  if (!piece) return { title: "Pieza no encontrada" };

  return {
    title: piece.title,
    description: piece.description.slice(0, 160),
    openGraph: {
      title: piece.title,
      description: piece.description.slice(0, 160),
      images: piece.images[0] ? [{ url: piece.images[0].url }] : undefined,
    },
  };
}

function formatDimensions(piece: {
  widthCm: number | null;
  heightCm: number | null;
  depthCm: number | null;
}): string | null {
  const { widthCm, heightCm, depthCm } = piece;
  if (!widthCm && !heightCm && !depthCm) return null;
  return [widthCm, heightCm, depthCm]
    .map((value) => (value ? `${value}` : "—"))
    .join(" × ")
    .concat(" cm");
}

export default async function PieceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const accessToken = await getAccessToken();
  const piece = await fetchFurnitureBySlug(slug, accessToken);

  if (!piece) notFound();

  const isFavorited = accessToken
    ? await fetchIsFavorited(accessToken, piece.id)
    : false;
  const myCollections = accessToken
    ? await fetchMyCollections(accessToken)
    : [];

  const byline = [piece.designer?.name, piece.manufacturer?.name]
    .filter(Boolean)
    .join(" para ");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: piece.title,
    description: piece.description,
    image: piece.images.map((image) => image.url),
    offers: {
      "@type": "Offer",
      price: piece.price,
      priceCurrency: piece.currency,
      availability:
        piece.status === "PUBLISHED"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <Container className="py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="grid min-w-0 gap-16 lg:grid-cols-[1.4fr_1fr]">
        <div className="min-w-0">
          <PieceGallery images={piece.images} title={piece.title} />
        </div>

        <div className="flex flex-col gap-10">
          <div>
            <p className="text-muted-foreground text-sm uppercase tracking-widest">
              {piece.category.name}
            </p>
            <h1 className="text-foreground mt-3 font-serif text-4xl">
              {piece.title}
            </h1>
            {byline ? (
              <p className="text-muted-foreground mt-2 text-sm">{byline}</p>
            ) : null}
            <p className="text-foreground mt-6 text-2xl">
              {formatPrice(piece.price, piece.currency)}
              {piece.priceType === "OFFER" ? (
                <span className="text-muted-foreground ml-2 text-sm">
                  (acepta ofertas)
                </span>
              ) : null}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <ContactSellerButton
              furnitureId={piece.id}
              isAuthenticated={Boolean(accessToken)}
              redirectPath={`/piezas/${piece.slug}`}
            />
            <FavoriteButton
              furnitureId={piece.id}
              initialIsFavorited={isFavorited}
              isAuthenticated={Boolean(accessToken)}
            />
          </div>

          {accessToken ? (
            <AddToCollectionMenu
              furnitureId={piece.id}
              collections={myCollections}
            />
          ) : null}

          <SpecList
            specs={[
              { label: "Estilo", value: piece.style?.name },
              {
                label: "Materiales",
                value: piece.materials.map((m) => m.name).join(", ") || null,
              },
              {
                label: "Tipo de madera",
                value: piece.woodTypes.map((w) => w.name).join(", ") || null,
              },
              { label: "Color", value: piece.color },
              {
                label: "Década",
                value: piece.decade ? `Años ${piece.decade}` : null,
              },
              { label: "País de origen", value: piece.originCountry?.name },
              {
                label: "Originalidad",
                value:
                  piece.originality === "ORIGINAL"
                    ? "Original de época"
                    : "Reproducción",
              },
              {
                label: "Estado de conservación",
                value: CONDITION_LABELS[piece.condition],
              },
              {
                label: "Medidas (an × al × prof)",
                value: formatDimensions(piece),
              },
              {
                label: "Peso",
                value: piece.weightKg ? `${piece.weightKg} kg` : null,
              },
              {
                label: "Ubicación",
                value:
                  [piece.locationCity, piece.locationCountry?.name]
                    .filter(Boolean)
                    .join(", ") || null,
              },
            ]}
          />

          {piece.conditionNotes ? (
            <div>
              <p className="text-foreground text-sm">Sobre el estado</p>
              <p className="text-muted-foreground mt-2 text-sm">
                {piece.conditionNotes}
              </p>
            </div>
          ) : null}

          <div className="border-border border-t pt-6">
            <Link
              href={`/tiendas/${piece.store.slug}`}
              className="text-foreground text-sm hover:underline"
            >
              {piece.store.name}
            </Link>
            <p className="text-muted-foreground mt-1 text-xs">
              {piece.store.isVerified
                ? "Vendedor verificado"
                : "Vendedor de Nogal"}
            </p>
          </div>
        </div>
      </div>

      <div className="border-border mt-20 max-w-3xl border-t pt-10">
        <h2 className="text-foreground font-serif text-2xl">Descripción</h2>
        <p className="text-muted-foreground mt-4 whitespace-pre-line text-base leading-relaxed">
          {piece.description}
        </p>
      </div>

      <div className="border-border mt-20 border-t pt-10">
        <h2 className="text-foreground font-serif text-2xl">
          Piezas relacionadas
        </h2>
        <p className="text-muted-foreground mt-4 text-sm">
          Esta sección estará disponible próximamente en {siteConfig.name}.
        </p>
      </div>
    </Container>
  );
}
