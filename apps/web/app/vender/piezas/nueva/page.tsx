import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/container";
import { FurnitureForm } from "@/components/furniture/furniture-form";
import { fetchTaxonomyOptions } from "@/lib/api/taxonomy";
import { fetchMyStore } from "@/lib/api/stores";
import { getAccessToken } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Añadir pieza" };

export default async function NewPiecePage() {
  const accessToken = (await getAccessToken()) as string;
  const store = await fetchMyStore(accessToken);
  if (!store) redirect("/vender");

  const taxonomy = await fetchTaxonomyOptions();

  return (
    <Container className="py-20">
      <div className="max-w-2xl">
        <p className="text-muted-foreground text-sm uppercase tracking-widest">
          {store.name}
        </p>
        <h1 className="text-foreground mt-3 text-3xl">Añadir una pieza</h1>
        <p className="text-muted-foreground mt-4 text-sm">
          Completa la información básica y guarda para continuar con las
          fotografías.
        </p>

        <div className="mt-14">
          <FurnitureForm taxonomy={taxonomy} />
        </div>
      </div>
    </Container>
  );
}
