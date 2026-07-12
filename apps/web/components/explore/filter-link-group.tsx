import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  buildExploreHref,
  type ExploreSearchParams,
} from "@/lib/explore/search-params";

interface FilterLinkGroupProps {
  legend: string;
  paramKey: string;
  options: Array<{ value: string; label: string }>;
  activeValues: string[];
  basePath: string;
  currentParams: ExploreSearchParams;
}

/**
 * Cada opción es un enlace normal que activa/desactiva el valor en la URL
 * (sin JavaScript): reordena el estado de navegación, no estado de React.
 */
export function FilterLinkGroup({
  legend,
  paramKey,
  options,
  activeValues,
  basePath,
  currentParams,
}: FilterLinkGroupProps) {
  if (options.length === 0) return null;

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-foreground text-sm">{legend}</legend>
      <ul className="flex flex-col gap-2">
        {options.map((option) => {
          const isActive = activeValues.includes(option.value);
          const nextValues = isActive
            ? activeValues.filter((v) => v !== option.value)
            : [...activeValues, option.value];
          const href = buildExploreHref(basePath, currentParams, {
            [paramKey]: nextValues.length > 0 ? nextValues : null,
          });

          return (
            <li key={option.value}>
              <Link
                href={href}
                className="text-foreground/80 hover:text-foreground flex items-center gap-2 text-sm"
              >
                <span
                  aria-hidden
                  className={cn(
                    "border-border size-3.5 shrink-0 border",
                    isActive && "border-foreground bg-foreground",
                  )}
                />
                {option.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
