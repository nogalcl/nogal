import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/layout/container";

// Piezas icónicas y verificadas (Wikimedia Commons, licencia libre, sin
// personas ni marcas de agua) — una por categoría, distintas de las que ya
// aparecen en el carrusel del hero (ver hero.tsx) para no repetir fotografía
// en la misma página.
const categories = [
  {
    href: "/piezas?categoria=asientos",
    label: "Asientos",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Breuer_chair_2008.jpg",
    imageAlt:
      "Silla Cesca de Marcel Breuer, acero tubular cromado y asiento de rejilla de caña tejida",
    imageCredit: "Foto: Holger.Ellgaard / Wikimedia Commons, CC BY-SA 3.0",
  },
  {
    href: "/piezas?categoria=mesas-y-consolas",
    label: "Mesas y consolas",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/b/b9/E1027_table_by_Eileen_Gray%2C_Manchester_Art_Gallery_01.jpg",
    imageAlt: "Mesa E1027 de Eileen Gray, estructura de acero tubular cromado y sobre circular",
    imageCredit: "Foto: 14GTR / Wikimedia Commons, dominio público (CC0)",
  },
  {
    href: "/piezas?categoria=iluminacion",
    label: "Iluminación",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/51/Wilhelm-Wagenfeld-Leuchte.jpg",
    imageAlt: "Lámpara de mesa Bauhaus WG24 de Wilhelm Wagenfeld, vidrio y metal niquelado",
    imageCredit: "Foto: Vorderdeck / Wikimedia Commons",
  },
  {
    href: "/piezas?categoria=objetos-de-coleccion",
    label: "Objetos de colección",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/8/84/Marianne_brandt%2C_teiere%2C_1924.JPG",
    imageAlt: "Tetera Bauhaus de Marianne Brandt, metal plateado con asa de ébano, 1924",
    imageCredit: "Foto: Wikimedia Commons, CC BY-SA 3.0",
  },
  {
    href: "/piezas?categoria=antiguedades",
    label: "Antigüedades",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Armoire_MET_5208.jpg",
    imageAlt: "Armario francés en roble tallado, primera mitad del siglo XVIII, Metropolitan Museum",
    imageCredit: "The Metropolitan Museum of Art, dominio público (CC0)",
  },
] as const;

export function FeaturedCategories() {
  return (
    <section className="py-16 md:py-20">
      <Container>
        <div className="flex items-end justify-between gap-6 pb-8">
          <h2 className="text-foreground max-w-md text-2xl md:text-3xl">
            Categorías destacadas
          </h2>
          <Link
            href="/piezas"
            className="text-muted-foreground hover:text-foreground hidden text-sm md:inline"
          >
            Ver todas las piezas
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((category) => (
            <Link key={category.href} href={category.href} className="group flex flex-col gap-3">
              <div className="bg-muted relative aspect-3/4 w-full overflow-hidden">
                <Image
                  src={category.imageUrl}
                  alt={category.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 18vw, (min-width: 640px) 30vw, 45vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  unoptimized
                />
              </div>
              <p className="text-foreground text-sm">{category.label}</p>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
