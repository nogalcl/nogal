"use client";

import { useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  deleteCollectionAction,
  removeFromCollectionAction,
} from "@/lib/collections/actions";
import type { CollectionSummary } from "@/lib/api/types";

export function CollectionCard({ collection }: { collection: CollectionSummary }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="border-border border p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-foreground font-serif text-lg">{collection.name}</p>
          {collection.description ? (
            <p className="text-muted-foreground mt-1 text-sm">
              {collection.description}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await deleteCollectionAction(collection.id);
            })
          }
          className="text-muted-foreground hover:text-foreground shrink-0 text-xs underline-offset-4 hover:underline"
        >
          Eliminar
        </button>
      </div>

      {collection.items.length === 0 ? (
        <p className="text-muted-foreground mt-6 text-sm">
          Sin piezas todavía.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {collection.items.map((item) => (
            <div key={item.id} className="flex flex-col gap-2">
              <Link
                href={`/piezas/${item.slug}`}
                className="bg-muted relative block aspect-4/5 w-full overflow-hidden"
              >
                {item.primaryImage ? (
                  <Image
                    src={item.primaryImage.url}
                    alt={item.primaryImage.altText ?? item.title}
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                ) : null}
              </Link>
              <p className="text-foreground truncate text-xs">{item.title}</p>
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    await removeFromCollectionAction(collection.id, item.id);
                  })
                }
                className="text-muted-foreground hover:text-foreground text-left text-xs underline-offset-4 hover:underline"
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
