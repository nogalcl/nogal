import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { Avatar } from "@/components/common/avatar";
import { ExploreGrid } from "@/components/explore/explore-grid";
import { FollowButton } from "@/components/social/follow-button";
import { ContactSellerButton } from "@/components/messaging/contact-seller-button";
import { fetchPublicProfile } from "@/lib/api/profile";
import { getAccessToken } from "@/lib/auth/session";
import { siteConfig } from "@/lib/site";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await fetchPublicProfile(username);
  if (!profile) return { title: "Perfil no encontrado" };

  const name = `${profile.firstName} ${profile.lastName}`;
  return {
    title: name,
    description:
      profile.bio ?? `Perfil de ${name} en ${siteConfig.name}.`,
  };
}

function formatMemberSince(date: string): string {
  return new Date(date).toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
  });
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params;
  const accessToken = await getAccessToken();
  const profile = await fetchPublicProfile(username, accessToken);

  if (!profile) notFound();

  const name = `${profile.firstName} ${profile.lastName}`;
  const location = [profile.city, profile.country?.name]
    .filter(Boolean)
    .join(", ");
  const firstPieceId = profile.pieces[0]?.id;

  const stats: Array<{ label: string; value: string | number }> = [
    { label: "Piezas publicadas", value: profile.listingsCount },
    { label: "Vendidas", value: profile.salesCount },
    { label: "Calificación", value: "—" },
    { label: "Seguidores", value: profile.followersCount },
    { label: "Seguidos", value: profile.followingCount },
  ];

  return (
    <Container className="py-16">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-5">
          <Avatar name={name} imageUrl={profile.avatarUrl} className="size-16" />
          <div>
            <p className="text-muted-foreground text-sm uppercase tracking-widest">
              Perfil
            </p>
            <h1 className="text-foreground mt-2 font-serif text-3xl">{name}</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              @{profile.username}
              {location ? ` · ${location}` : ""}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              Miembro desde {formatMemberSince(profile.memberSince)}
            </p>
            {profile.store ? (
              <Link
                href={`/tiendas/${profile.store.slug}`}
                className="text-foreground mt-3 inline-block text-sm hover:underline"
              >
                Ver atelier: {profile.store.name}
              </Link>
            ) : null}
          </div>
        </div>

        {!profile.isOwnProfile ? (
          <div className="flex shrink-0 flex-col gap-3 sm:items-end">
            <FollowButton
              userId={profile.userId}
              profilePath={`/perfil/${profile.username}`}
              initialIsFollowing={profile.isFollowedByViewer}
              isAuthenticated={Boolean(accessToken)}
            />
            {firstPieceId ? (
              <ContactSellerButton
                furnitureId={firstPieceId}
                isAuthenticated={Boolean(accessToken)}
                redirectPath={`/perfil/${profile.username}`}
              />
            ) : null}
          </div>
        ) : null}
      </div>

      {profile.bio ? (
        <p className="text-muted-foreground mt-8 max-w-2xl text-base leading-relaxed">
          {profile.bio}
        </p>
      ) : null}

      <dl className="border-border mt-10 grid grid-cols-2 gap-6 border-y py-8 sm:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.label}>
            <dt className="text-muted-foreground text-xs uppercase tracking-widest">
              {stat.label}
            </dt>
            <dd className="text-foreground mt-2 font-serif text-2xl">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-16">
        <h2 className="text-foreground font-serif text-2xl">
          Piezas publicadas
        </h2>
        <div className="mt-8">
          <ExploreGrid
            items={profile.pieces}
            emptyTitle="Sin piezas publicadas todavía"
            emptyDescription="Cuando publique piezas, aparecerán aquí."
          />
        </div>
      </div>
    </Container>
  );
}
