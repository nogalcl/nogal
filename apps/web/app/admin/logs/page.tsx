import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireStaff } from "@/lib/auth/require-staff";
import { fetchAuditLogs } from "@/lib/api/admin";

export const metadata: Metadata = { title: "Logs — Administración" };

function formatTimestamp(date: string): string {
  return new Date(date).toLocaleString("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminLogsPage() {
  const { accessToken } = await requireStaff(["ADMIN"], "/admin/logs");
  const logs = await fetchAuditLogs(accessToken);

  return (
    <Container className="py-16">
      <p className="text-muted-foreground text-sm uppercase tracking-widest">
        Administración
      </p>
      <h1 className="text-foreground mt-3 font-serif text-4xl">Registro de actividad</h1>
      <p className="text-muted-foreground mt-4 max-w-xl text-sm">
        Últimas 100 acciones registradas — asignaciones, cambios de estado,
        verificaciones y moderación.
      </p>

      <div className="mt-10">
        <AdminNav current="/admin/logs" />
      </div>

      <div className="border-border mt-10 flex flex-col divide-y border-t">
        {logs.map((log) => (
          <div key={log.id} className="flex items-center gap-4 py-3 text-sm">
            <span className="text-muted-foreground w-40 shrink-0 text-xs">
              {formatTimestamp(log.createdAt)}
            </span>
            <span className="text-foreground flex-1">{log.action}</span>
            <span className="text-muted-foreground shrink-0 text-xs">
              {log.actorName ?? "Sistema"}
            </span>
          </div>
        ))}
      </div>
    </Container>
  );
}
