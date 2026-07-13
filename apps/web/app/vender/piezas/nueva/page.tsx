import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { FurnitureForm } from "@/components/furniture/furniture-form";
import { fetchTaxonomyOptions } from "@/lib/api/taxonomy";
import { fetchMyStore } from "@/lib/api/stores";
import { getAccessToken } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Añadir pieza" };

export default async function NewPiecePage() {
  const accessToken = (await getAccessToken()) as string;
  const store = await fetchMyStore(accessToken);
  const taxonomy = await fetchTaxonomyOptions();

  return (
    <Container className="py-20">
      <div className="max-w-2xl">
        <p className="text-muted-foreground text-sm uppercase tracking-widest">
          {store.name}
        </p>
        <h1 className="text-foreground mt-3 text-3xl">Añadir una pieza</h1>
        <p className="text-muted-foreground mt-4 text-sm">
          Añade fotos y los datos esenciales — el resto es opcional y puedes
          completarlo después.
        </p>

        <div className="mt-14">
          <FurnitureForm taxonomy={taxonomy} />
        </div>
      </div>
    </Container>
  );
}
