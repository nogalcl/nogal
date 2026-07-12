"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addFavoriteAction, removeFavoriteAction } from "@/lib/favorites/actions";

export function FavoriteButton({
  furnitureId,
  initialIsFavorited,
  isAuthenticated,
  size = "lg",
}: {
  furnitureId: string;
  initialIsFavorited: boolean;
  isAuthenticated: boolean;
  size?: "lg" | "default";
}) {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function toggle() {
    if (!isAuthenticated) {
      router.push(
        `/iniciar-sesion?next=${encodeURIComponent(window.location.pathname)}`,
      );
      return;
    }
    const next = !isFavorited;
    setIsFavorited(next);
    startTransition(async () => {
      const result = next
        ? await addFavoriteAction(furnitureId)
        : await removeFavoriteAction(furnitureId);
      if (result.error) setIsFavorited(!next);
    });
  }

  return (
    <Button
      size={size}
      variant="outline"
      onClick={toggle}
      disabled={isPending}
      aria-pressed={isFavorited}
    >
      <Heart className={isFavorited ? "fill-foreground" : undefined} />
      {isFavorited ? "Guardado en favoritos" : "Guardar en favoritos"}
    </Button>
  );
}
