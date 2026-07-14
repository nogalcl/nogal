import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { RestorerForm } from "@/components/admin/restorer-form";
import { requireStaff } from "@/lib/auth/require-staff";

export const metadata: Metadata = { title: "Agregar restaurador — Administración" };

export default async function NewRestorerPage() {
  await requireStaff(["MODERATOR", "ADMIN"], "/admin/restauradores/nuevo");

  return (
    <Container className="py-16">
      <Link
        href="/admin/restauradores"
        className="text-muted-foreground hover:text-foreground text-sm"
      >
        ← Restauradores
      </Link>

      <h1 className="text-foreground mt-6 font-serif text-3xl">
        Agregar restaurador
      </h1>

      <div className="mt-10 max-w-lg">
        <RestorerForm />
      </div>
    </Container>
  );
}
