import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { FurnitureForm } from "@/components/furniture/furniture-form";
import { StatusLabel } from "@/components/furniture/status-label";
import { fetchFurnitureById } from "@/lib/api/furniture";
import { fetchTaxonomyOptions } from "@/lib/api/taxonomy";
import { getAccessToken } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Editar pieza" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPiecePage({ params }: PageProps) {
  const { id } = await params;
  const accessToken = (await getAccessToken()) as string;

  const [furniture, taxonomy] = await Promise.all([
    fetchFurnitureById(accessToken, id),
    fetchTaxonomyOptions(),
  ]);

  return (
    <Container className="py-20">
      <div className="max-w-2xl">
        <div className="flex items-center gap-3">
          <p className="text-muted-foreground text-sm uppercase tracking-widest">
            Editar pieza
          </p>
          <StatusLabel status={furniture.status} />
        </div>
        <h1 className="text-foreground mt-3 text-3xl">{furniture.title}</h1>

        <div className="mt-14">
          <FurnitureForm taxonomy={taxonomy} furniture={furniture} />
        </div>
      </div>
    </Container>
  );
}
