import Image from "next/image";
import { cn } from "@/lib/utils";

/** Sin librería de avatar: solo una imagen o las iniciales sobre un círculo tinta. */
export function Avatar({
  name,
  imageUrl,
  className,
}: {
  name: string;
  imageUrl?: string | null;
  className?: string;
}) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  if (imageUrl) {
    return (
      <div
        className={cn(
          "relative size-12 shrink-0 overflow-hidden rounded-full",
          className,
        )}
      >
        <Image src={imageUrl} alt={name} fill className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-foreground text-background flex size-12 shrink-0 items-center justify-center rounded-full font-serif text-lg",
        className,
      )}
      aria-hidden
    >
      {initials || "?"}
    </div>
  );
}
