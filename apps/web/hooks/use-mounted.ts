import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

/**
 * true solo tras la hidratación en cliente. Evita el patrón
 * "setState dentro de un effect" (marcado por react-hooks/set-state-in-effect)
 * usando useSyncExternalStore, pensado exactamente para sincronizar con este
 * tipo de estado externo (SSR vs. cliente).
 */
export function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
