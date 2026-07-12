import Image from "next/image";
import Link from "next/link";
import { TREND_CATEGORY_LABELS } from "@/lib/trends/constants";
import type { TrendPreview } from "@/lib/api/types";

/** Vínculo relacionado más relevante para mostrar como segunda línea de
 * contexto en la tarjeta (diseñador > fabricante > estilo > material). */
function primaryRelated(trend: TrendPreview): string | null {
  return (
    trend.designer?.name ??
    trend.manufacturer?.name ??
    trend.style?.name ??
    trend.material?.name ??
    trend.woodType?.name ??
    null
  );
}

export function TrendCard({
  trend,
  featured = false,
}: {
  trend: TrendPreview;
  featured?: boolean;
}) {
  const related = primaryRelated(trend);

  return (
    <Link href={`/tendencias/${trend.slug}`} className="group flex flex-col gap-4">
      <div
        className={`bg-muted relative w-full overflow-hidden ${
          featured ? "aspect-3/2" : "aspect-4/5"
        }`}
      >
        <Image
          src={trend.imageUrl}
          alt={trend.imageAlt}
          fill
          sizes={
            featured
              ? "(min-width: 1024px) 70vw, 90vw"
              : "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
          }
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          priority={featured}
          // Wikimedia Commons rate-limita las descargas repetidas desde una
          // misma IP; el optimizador de Next reenvía la petición desde el
          // servidor y agrupa 20+ imágenes en ráfaga, lo que dispara 429.
          // Sirviendo el original directo al navegador el tráfico se
          // reparte por cliente, como espera Wikimedia.
          unoptimized
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground text-xs uppercase tracking-widest">
          {TREND_CATEGORY_LABELS[trend.category]}
          {related ? ` · ${related}` : ""}
        </p>
        <h3
          className={`text-foreground font-serif ${
            featured ? "text-3xl sm:text-4xl" : "text-xl"
          }`}
        >
          {trend.title}
        </h3>
        <p
          className={`text-muted-foreground ${featured ? "max-w-2xl text-base" : "line-clamp-3 text-sm"}`}
        >
          {trend.excerpt}
        </p>
        <span className="text-foreground mt-1 text-sm underline-offset-4 group-hover:underline">
          Leer más
        </span>
      </div>
    </Link>
  );
}
