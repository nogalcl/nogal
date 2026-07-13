"use client";

import { useState, useSyncExternalStore } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

function subscribe() {
  // El navegador no emite un evento cuando cambia el permiso — el propio
  // botón fuerza el re-render tras requestPermission() (ver más abajo), así
  // que no hace falta suscribirse a nada real aquí.
  return () => undefined;
}

function getSnapshot(): NotificationPermission | "unsupported" {
  return typeof Notification === "undefined" ? "unsupported" : Notification.permission;
}

function getServerSnapshot(): NotificationPermission | "unsupported" {
  return "unsupported";
}

/**
 * Solo se ofrece aquí, en Mensajes — nunca como prompt global al entrar al
 * sitio (ver DESIGN_PRINCIPLES.md §2: nada de onboarding intrusivo). Si el
 * usuario ya respondió (concedido o denegado), no se vuelve a mostrar.
 *
 * useSyncExternalStore en vez de useState+useEffect: Notification.permission
 * es un valor que no existe durante el render en el servidor, y leerlo así
 * evita el falso "parpadeo" de un efecto asíncrono solo para eso.
 */
export function NotificationPermissionButton() {
  const initialPermission = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || initialPermission !== "default") return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        await Notification.requestPermission();
        setDismissed(true);
      }}
    >
      <Bell className="size-4" />
      Avisarme de nuevos mensajes
    </Button>
  );
}
