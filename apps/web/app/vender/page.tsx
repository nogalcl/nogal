import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { fetchMyFurniture } from "@/lib/api/furniture";
import { fetchMyStore } from "@/lib/api/stores";
import { getAccessToken } from "@/lib/auth/session";
import { STATUS_LABELS } from "@/lib/furniture/constants";

export const metadata: Metadata = { title: "Vender" };

export default async function SellPage() {
  const accessToken = (await getAccessToken()) as string;
  const store = await fetchMyStore(accessToken);
  const pieces = await fetchMyFurniture(accessToken);
  const counts = pieces.reduce<Record<string, number>>((acc, piece) => {
    acc[piece.status] = (acc[piece.status] ?? 0) + 1;
    return acc;
  }, {});
  const summary = Object.entries(STATUS_LABELS)
    .filter(([status]) => counts[status])
    .map(([status, label]) => `${counts[status]} ${label.toLowerCase()}`)
    .join(", ");

  return (
    <Container className="py-20">
      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm uppercase tracking-widest">
          Vender — {store.name}
        </p>
        <h1 className="text-foreground text-3xl">Tu atelier</h1>
        <p className="text-muted-foreground max-w-lg text-sm">
          {pieces.length === 0
            ? "Todavía no has añadido ninguna pieza."
            : `Tienes ${pieces.length} ${pieces.length === 1 ? "pieza" : "piezas"} en tu catálogo: ${summary}.`}
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <Button asChild>
          <Link href="/vender/piezas/nueva">Añadir una pieza</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/vender/piezas">Gestionar mis piezas</Link>
        </Button>
      </div>
    </Container>
  );
}
