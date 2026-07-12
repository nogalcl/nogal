"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { followUserAction, unfollowUserAction } from "@/lib/social/actions";

export function FollowButton({
  userId,
  profilePath,
  initialIsFollowing,
  isAuthenticated,
}: {
  userId: string;
  profilePath: string;
  initialIsFollowing: boolean;
  isAuthenticated: boolean;
}) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!isAuthenticated) {
    return (
      <Button
        variant="outline"
        onClick={() =>
          router.push(`/iniciar-sesion?next=${encodeURIComponent(profilePath)}`)
        }
      >
        Seguir
      </Button>
    );
  }

  function toggle() {
    const next = !isFollowing;
    setIsFollowing(next);
    startTransition(async () => {
      const result = next
        ? await followUserAction(userId, profilePath)
        : await unfollowUserAction(userId, profilePath);
      if (result.error) setIsFollowing(!next);
    });
  }

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      onClick={toggle}
      disabled={isPending}
      aria-pressed={isFollowing}
    >
      {isFollowing ? "Siguiendo" : "Seguir"}
    </Button>
  );
}
