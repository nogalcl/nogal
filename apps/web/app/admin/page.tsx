import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireStaff } from "@/lib/auth/require-staff";
import { fetchFurnitureForModeration, fetchPendingReports } from "@/lib/api/admin";

export const metadata: Metadata = { title: "Administración" };

export default async function AdminDashboardPage() {
  const { accessToken, user } = await requireStaff(["MODERATOR", "ADMIN"], "/admin");

  const [pending, reports] = await Promise.all([
    fetchFurnitureForModeration(accessToken, "UNDER_REVIEW"),
    fetchPendingReports(accessToken),
  ]);

  return (
    <Container className="py-16">
      <p className="text-muted-foreground text-sm uppercase tracking-widest">
        Administración
      </p>
      <h1 className="text-foreground mt-3 font-serif text-4xl">
        Panel de {user.role === "ADMIN" ? "administración" : "moderación"}
      </h1>

      <div className="mt-10">
        <AdminNav current="/admin" />
      </div>

      <div className="border-border mt-10 grid gap-8 border-t pt-10 sm:grid-cols-2">
        <Link
          href="/admin/moderacion"
          className="border-border hover:bg-muted block border p-6"
        >
          <p className="text-foreground font-serif text-2xl">{pending.length}</p>
          <p className="text-muted-foreground mt-2 text-sm">
            {pending.length === 1 ? "pieza pendiente de revisión" : "piezas pendientes de revisión"}
          </p>
        </Link>
        <Link
          href="/admin/reportes"
          className="border-border hover:bg-muted block border p-6"
        >
          <p className="text-foreground font-serif text-2xl">{reports.length}</p>
          <p className="text-muted-foreground mt-2 text-sm">
            {reports.length === 1 ? "reporte pendiente" : "reportes pendientes"}
          </p>
        </Link>
      </div>
    </Container>
  );
}
