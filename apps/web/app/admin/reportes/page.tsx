import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { AdminNav } from "@/components/admin/admin-nav";
import { ReportResolveActions } from "@/components/admin/report-resolve-actions";
import { requireStaff } from "@/lib/auth/require-staff";
import { fetchPendingReports } from "@/lib/api/admin";

export const metadata: Metadata = { title: "Reportes — Administración" };

const TARGET_LABELS: Record<string, string> = {
  FURNITURE: "Pieza",
  USER: "Usuario",
  STORE: "Tienda",
  MESSAGE: "Mensaje",
  CONVERSATION: "Conversación",
};

function formatTimestamp(date: string): string {
  return new Date(date).toLocaleString("es-CL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminReportsPage() {
  const { accessToken } = await requireStaff(["MODERATOR", "ADMIN"], "/admin/reportes");
  const reports = await fetchPendingReports(accessToken);

  return (
    <Container className="py-16">
      <p className="text-muted-foreground text-sm uppercase tracking-widest">
        Administración
      </p>
      <h1 className="text-foreground mt-3 font-serif text-4xl">Reportes</h1>

      <div className="mt-10">
        <AdminNav current="/admin/reportes" />
      </div>

      {reports.length === 0 ? (
        <p className="text-muted-foreground mt-12 text-sm">
          No hay reportes pendientes.
        </p>
      ) : (
        <div className="border-border mt-10 flex flex-col divide-y border-t">
          {reports.map((report) => (
            <div key={report.id} className="flex flex-col gap-3 py-6">
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground text-xs uppercase tracking-widest">
                  {TARGET_LABELS[report.targetType] ?? report.targetType}
                </span>
                <span className="text-muted-foreground text-xs">
                  {formatTimestamp(report.createdAt)}
                </span>
              </div>
              <p className="text-foreground text-sm">{report.reason}</p>
              <ReportResolveActions id={report.id} />
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
