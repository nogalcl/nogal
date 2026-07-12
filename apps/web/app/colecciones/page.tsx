import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/container";
import { CollectionCard } from "@/components/collections/collection-card";
import { CreateCollectionForm } from "@/components/collections/create-collection-form";
import { fetchMyCollections } from "@/lib/api/collections";
import { getAccessToken } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Mis colecciones" };

export default async function CollectionsPage() {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    redirect("/iniciar-sesion?next=/colecciones");
  }

  const collections = await fetchMyCollections(accessToken);

  return (
    <Container className="py-16">
      <p className="text-muted-foreground text-sm uppercase tracking-widest">
        Guardado
      </p>
      <h1 className="text-foreground mt-3 font-serif text-4xl">
        Mis colecciones
      </h1>
      <p className="text-muted-foreground mt-4 max-w-xl text-sm">
        Organiza las piezas que te interesan en tableros propios. Solo tú
        puedes verlas por ahora.
      </p>

      <div className="mt-10">
        <CreateCollectionForm />
      </div>

      <div className="mt-10 flex flex-col gap-8">
        {collections.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Todavía no creaste ninguna colección.
          </p>
        ) : (
          collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))
        )}
      </div>
    </Container>
  );
}
