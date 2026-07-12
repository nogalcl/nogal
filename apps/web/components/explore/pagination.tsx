import Link from "next/link";
import {
  buildExploreHref,
  type ExploreSearchParams,
} from "@/lib/explore/search-params";

interface PaginationProps {
  basePath: string;
  params: ExploreSearchParams;
  page: number;
  totalPages: number;
}

export function Pagination({
  basePath,
  params,
  page,
  totalPages,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, i) => i + 1,
  ).filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1);

  return (
    <nav
      aria-label="Paginación"
      className="border-border mt-16 flex items-center justify-center gap-6 border-t pt-8 text-sm"
    >
      {page > 1 ? (
        <Link
          href={buildExploreHref(basePath, params, {
            pagina: String(page - 1),
          })}
          className="text-foreground hover:underline"
        >
          Anterior
        </Link>
      ) : (
        <span className="text-muted-foreground/40">Anterior</span>
      )}

      <ul className="flex items-center gap-3">
        {pageNumbers.map((n, index) => {
          const previous = pageNumbers[index - 1];
          const showEllipsis = previous !== undefined && n - previous > 1;
          return (
            <li key={n} className="flex items-center gap-3">
              {showEllipsis ? (
                <span className="text-muted-foreground">…</span>
              ) : null}
              <Link
                href={buildExploreHref(basePath, params, { pagina: String(n) })}
                aria-current={n === page ? "page" : undefined}
                className={
                  n === page
                    ? "text-foreground underline underline-offset-4"
                    : "text-muted-foreground hover:text-foreground"
                }
              >
                {n}
              </Link>
            </li>
          );
        })}
      </ul>

      {page < totalPages ? (
        <Link
          href={buildExploreHref(basePath, params, {
            pagina: String(page + 1),
          })}
          className="text-foreground hover:underline"
        >
          Siguiente
        </Link>
      ) : (
        <span className="text-muted-foreground/40">Siguiente</span>
      )}
    </nav>
  );
}
