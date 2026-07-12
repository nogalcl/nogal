import Link from "next/link";
import { TREND_CATEGORY_OPTIONS } from "@/lib/trends/constants";
import type { TrendCategory } from "@/lib/api/types";

export function TrendCategoryFilter({ current }: { current?: TrendCategory }) {
  return (
    <nav
      aria-label="Filtrar por categoría"
      className="border-border flex flex-wrap gap-x-6 gap-y-2 border-t border-b py-4 text-sm"
    >
      <Link
        href="/tendencias"
        className={
          !current
            ? "text-foreground underline underline-offset-4"
            : "text-muted-foreground hover:text-foreground"
        }
      >
        Todas
      </Link>
      {TREND_CATEGORY_OPTIONS.map((option) => (
        <Link
          key={option.value}
          href={`/tendencias?categoria=${option.value}`}
          className={
            current === option.value
              ? "text-foreground underline underline-offset-4"
              : "text-muted-foreground hover:text-foreground"
          }
        >
          {option.label}
        </Link>
      ))}
    </nav>
  );
}
