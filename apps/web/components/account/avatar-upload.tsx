"use client";

import { useRef, useState, useTransition } from "react";
import { Avatar } from "@/components/common/avatar";
import { removeAvatarAction, uploadAvatarAction } from "@/lib/account/actions";

export function AvatarUpload({
  name,
  initialAvatarUrl,
}: {
  name: string;
  initialAvatarUrl: string | null;
}) {
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadAvatarAction(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setAvatarUrl(result.avatarUrl ?? null);
      }
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  function handleRemove() {
    setError(null);
    startTransition(async () => {
      const result = await removeAvatarAction();
      if (result.error) {
        setError(result.error);
      } else {
        setAvatarUrl(null);
      }
    });
  }

  return (
    <div className="flex items-center gap-5">
      <Avatar name={name} imageUrl={avatarUrl} className="size-16 text-xl" />
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <label className="text-foreground cursor-pointer text-sm underline-offset-4 hover:underline">
            {avatarUrl ? "Cambiar foto" : "Agregar foto"}
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              onChange={(event) => handleFile(event.target.files)}
              disabled={isPending}
              className="sr-only"
            />
          </label>
          {avatarUrl ? (
            <button
              type="button"
              onClick={handleRemove}
              disabled={isPending}
              className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
            >
              Quitar
            </button>
          ) : null}
        </div>
        {error ? <p className="text-destructive text-xs">{error}</p> : null}
      </div>
    </div>
  );
}
