import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/common/breadcrumbs";

export interface IndexEntity {
  slug: string;
  name: string;
  description?: string | null;
}

export function EntityIndexPage({
  eyebrow,
  title,
  description,
  breadcrumbs,
  basePath,
  entities,
}: {
  eyebrow: string;
  title: string;
  description: string;
  breadcrumbs: BreadcrumbItem[];
  basePath: string;
  entities: IndexEntity[];
}) {
  return (
    <Container className="py-16">
      <div className="mb-8">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      <div className="max-w-2xl">
        <p className="text-muted-foreground text-sm uppercase tracking-widest">
          {eyebrow}
        </p>
        <h1 className="text-foreground mt-3 font-serif text-4xl">{title}</h1>
        <p className="text-muted-foreground mt-4 text-base">{description}</p>
      </div>

      <div className="border-border mt-14 grid gap-x-8 gap-y-10 border-t pt-10 sm:grid-cols-2 lg:grid-cols-3">
        {entities.map((entity) => (
          <Link key={entity.slug} href={`${basePath}/${entity.slug}`} className="group">
            <p className="text-foreground font-serif text-xl group-hover:underline">
              {entity.name}
            </p>
            {entity.description ? (
              <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
                {entity.description}
              </p>
            ) : null}
          </Link>
        ))}
      </div>
    </Container>
  );
}
