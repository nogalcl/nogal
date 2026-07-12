import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { AdminNav } from "@/components/admin/admin-nav";
import { FurnitureModerationActions } from "@/components/admin/furniture-moderation-actions";
import { requireStaff } from "@/lib/auth/require-staff";
import { fetchFurnitureForModeration } from "@/lib/api/admin";
import { formatPrice } from "@/lib/format/currency";

export const metadata: Metadata = { title: "Moderación de piezas" };

export default async function ModerationPage() {
  const { accessToken } = await requireStaff(["MODERATOR", "ADMIN"], "/admin/moderacion");
  const pending = await fetchFurnitureForModeration(accessToken, "UNDER_REVIEW");

  return (
    <Container className="py-16">
      <p className="text-muted-foreground text-sm uppercase tracking-widest">
        Administración
      </p>
      <h1 className="text-foreground mt-3 font-serif text-4xl">Moderación</h1>

      <div className="mt-10">
        <AdminNav current="/admin/moderacion" />
      </div>

      {pending.length === 0 ? (
        <p className="text-muted-foreground mt-12 text-sm">
          No hay piezas pendientes de revisión.
        </p>
      ) : (
        <div className="border-border mt-10 flex flex-col divide-y border-t">
          {pending.map((piece) => (
            <div key={piece.id} className="flex items-center gap-4 py-6">
              <div className="bg-muted relative size-16 shrink-0 overflow-hidden">
                {piece.images[0] ? (
                  <Image
                    src={piece.images[0].url}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/piezas/${piece.slug}`}
                  target="_blank"
                  className="text-foreground text-sm hover:underline"
                >
                  {piece.title}
                </Link>
                <p className="text-muted-foreground mt-1 text-sm">
                  {piece.store.name} · {piece.category.name} ·{" "}
                  {formatPrice(piece.price, piece.currency)}
                </p>
              </div>
              <FurnitureModerationActions id={piece.id} />
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
