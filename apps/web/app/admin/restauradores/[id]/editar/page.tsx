import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { RestorerForm } from "@/components/admin/restorer-form";
import { requireStaff } from "@/lib/auth/require-staff";
import { fetchRestorer } from "@/lib/api/admin";

export const metadata: Metadata = { title: "Editar restaurador — Administración" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRestorerPage({ params }: PageProps) {
  const { id } = await params;
  const { accessToken } = await requireStaff(
    ["MODERATOR", "ADMIN"],
    `/admin/restauradores/${id}/editar`,
  );
  const restorer = await fetchRestorer(accessToken, id).catch(() => null);
  if (!restorer) notFound();

  return (
    <Container className="py-16">
      <Link
        href="/admin/restauradores"
        className="text-muted-foreground hover:text-foreground text-sm"
      >
        ← Restauradores
      </Link>

      <h1 className="text-foreground mt-6 font-serif text-3xl">
        {restorer.name}
      </h1>

      <div className="mt-10 max-w-lg">
        <RestorerForm restorer={restorer} />
      </div>
    </Container>
  );
}
