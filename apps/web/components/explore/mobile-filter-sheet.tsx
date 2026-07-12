"use client";

import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MobileFilterSheet({ children }: { children: React.ReactNode }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden">
          <SlidersHorizontal className="size-4" />
          Filtros
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full max-w-xs overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-serif text-xl">Filtros</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-10">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
