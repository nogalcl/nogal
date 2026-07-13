import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { PieceActions } from "@/components/furniture/piece-actions";
import { StatusLabel } from "@/components/furniture/status-label";
import { fetchMyFurniture } from "@/lib/api/furniture";
import { fetchMyStore } from "@/lib/api/stores";
import { getAccessToken } from "@/lib/auth/session";
import { formatPrice } from "@/lib/format/currency";

export const metadata: Metadata = { title: "Mis piezas" };

export default async function MyPiecesPage() {
  const accessToken = (await getAccessToken()) as string;
  const store = await fetchMyStore(accessToken);
  const pieces = await fetchMyFurniture(accessToken);

  return (
    <Container className="py-20">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-muted-foreground text-sm uppercase tracking-widest">
            {store.name}
          </p>
          <h1 className="text-foreground mt-3 text-3xl">Mis piezas</h1>
        </div>
        <Button asChild>
          <Link href="/vender/piezas/nueva">Añadir una pieza</Link>
        </Button>
      </div>

      {pieces.length === 0 ? (
        <p className="border-border bg-card text-muted-foreground mt-16 border px-6 py-10 text-sm">
          Todavía no has añadido ninguna pieza.
        </p>
      ) : (
        <ul className="divide-border border-border mt-14 flex flex-col divide-y border-t">
          {pieces.map((piece) => (
            <li
              key={piece.id}
              className="flex flex-wrap items-center gap-6 py-6"
            >
              <div className="border-border bg-muted relative size-20 shrink-0 overflow-hidden border">
                {piece.images[0] ? (
                  <Image
                    src={piece.images[0].url}
                    alt={piece.images[0].altText ?? piece.title}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : null}
              </div>

              <div className="min-w-[220px] flex-1">
                <Link
                  href={`/vender/piezas/${piece.id}/editar`}
                  className="text-foreground underline-offset-4 hover:underline"
                >
                  {piece.title}
                </Link>
                <div className="mt-1 flex items-center gap-3">
                  <StatusLabel status={piece.status} />
                  <span className="text-muted-foreground text-sm">
                    {formatPrice(piece.price, piece.currency)}
                  </span>
                </div>
                {piece.status === "REJECTED" && piece.rejectionReason ? (
                  <p className="text-destructive mt-2 max-w-md text-xs">
                    {piece.rejectionReason}
                  </p>
                ) : null}
              </div>

              <PieceActions id={piece.id} status={piece.status} />
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
