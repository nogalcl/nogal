import Link from "next/link";
import { siteConfig } from "@/lib/site";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/** Migas de pan + JSON-LD BreadcrumbList a la vez, para no duplicar la
 * misma lista en dos sitios distintos del árbol. */
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href ? `${siteConfig.url}${item.href}` : undefined,
    })),
  };

  return (
    <nav aria-label="Ruta de navegación">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ol className="text-muted-foreground flex flex-wrap items-center gap-x-2 text-xs">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-2">
            {index > 0 ? <span aria-hidden>/</span> : null}
            {item.href ? (
              <Link href={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
