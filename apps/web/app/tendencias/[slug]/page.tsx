import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { Container } from "@/components/layout/container";
import { ArticleContent } from "@/components/knowledge-base/article-content";
import { RelatedContent } from "@/components/knowledge-base/related-content";
import { fetchTrendBySlug } from "@/lib/api/trends";
import { TREND_CATEGORY_LABELS } from "@/lib/trends/constants";
import { siteConfig } from "@/lib/site";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const trend = await fetchTrendBySlug(slug);
  if (!trend) return { title: "Tendencia no encontrada" };

  return {
    title: trend.title,
    description: trend.excerpt,
    alternates: { canonical: `${siteConfig.url}/tendencias/${trend.slug}` },
    openGraph: {
      title: trend.title,
      description: trend.excerpt,
      images: [{ url: trend.imageUrl }],
    },
  };
}

export default async function TrendDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const trend = await fetchTrendBySlug(slug);
  if (!trend) notFound();

  const publishedDate = new Date(trend.publishedAt).toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: trend.title,
    description: trend.excerpt,
    image: trend.imageUrl,
    datePublished: trend.publishedAt,
    author: { "@type": "Organization", name: siteConfig.name },
    publisher: { "@type": "Organization", name: siteConfig.name },
  };

  const relatedGroups = [
    { label: "Diseñador relacionado", basePath: "/disenadores", items: trend.designer ? [trend.designer] : [] },
    { label: "Fabricante relacionado", basePath: "/fabricantes", items: trend.manufacturer ? [trend.manufacturer] : [] },
    { label: "Estilo relacionado", basePath: "/estilos", items: trend.style ? [trend.style] : [] },
    { label: "Material relacionado", basePath: "/materiales", items: trend.material ? [trend.material] : [] },
    { label: "Madera relacionada", basePath: "/maderas", items: trend.woodType ? [trend.woodType] : [] },
  ];

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Container className="pt-16">
        <Breadcrumbs
          items={[
            { label: "Inicio", href: "/" },
            { label: "Tendencias", href: "/tendencias" },
            { label: trend.title },
          ]}
        />

        <div className="mt-8 max-w-3xl">
          <p className="text-muted-foreground text-sm uppercase tracking-widest">
            {TREND_CATEGORY_LABELS[trend.category]}
          </p>
          <h1 className="text-foreground mt-3 font-serif text-4xl sm:text-5xl">
            {trend.title}
          </h1>
          <p className="text-foreground mt-6 text-lg leading-relaxed">{trend.excerpt}</p>
        </div>
      </Container>

      <div className="bg-muted relative mt-10 aspect-3/2 w-full sm:aspect-video">
        <Image
          src={trend.imageUrl}
          alt={trend.imageAlt}
          fill
          sizes="100vw"
          priority
          className="object-cover"
          // Ver nota en trend-card.tsx: se sirve el original de Wikimedia
          // Commons directo al navegador para evitar el rate-limit 429 del
          // optimizador de imágenes de Next al reenviar la petición.
          unoptimized
        />
      </div>

      <Container className="pb-20">
        {trend.imageCredit ? (
          <p className="text-muted-foreground mt-3 text-xs">{trend.imageCredit}</p>
        ) : null}

        <div className="mt-10 max-w-2xl">
          <ArticleContent content={trend.body} />
        </div>

        <div className="mt-10 max-w-2xl text-sm">
          <p className="text-muted-foreground">
            Actualizado el {publishedDate} · Fuente:{" "}
            <Link
              href={trend.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:underline"
            >
              {trend.sourceName}
            </Link>
          </p>
        </div>

        <RelatedContent groups={relatedGroups} />
      </Container>
    </article>
  );
}
