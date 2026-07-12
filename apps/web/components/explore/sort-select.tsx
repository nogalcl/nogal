"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SORT_OPTIONS, sortToUrlValue } from "@/lib/explore/search-params";
import type { FurnitureSort } from "@/lib/api/types";

export function SortSelect({
  basePath,
  currentSort,
}: {
  basePath: string;
  currentSort: FurnitureSort;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(sort: string) {
    const next = new URLSearchParams(searchParams.toString());
    next.set("orden", sort);
    next.delete("pagina");
    router.push(`${basePath}?${next.toString()}`);
  }

  return (
    <Select value={sortToUrlValue(currentSort)} onValueChange={handleChange}>
      <SelectTrigger className="w-52">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={sortToUrlValue(option.value)}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
