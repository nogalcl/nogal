import Link from "next/link";

import { Container } from "@/components/layout/container";
import { HeroCarousel, type HeroSlide } from "@/components/marketing/hero-carousel";
import { Button } from "@/components/ui/button";

// Piezas icónicas y verificadas (Wikimedia Commons, licencia libre, sin
// personas ni marcas de agua) — cuero y metal cromado/aluminio, en la línea
// Bauhaus/moderna que define la identidad visual de Nogal.
const HERO_SLIDES: HeroSlide[] = [
  {
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/4/40/Farnsworth_House_%285923839782%29.jpg",
    imageAlt:
      "Comedor de la Casa Farnsworth: sillas MR de Mies van der Rohe en cuero coñac y acero cromado alrededor de una mesa de nogal",
    imageCredit: "Foto: Benjamin Lipsman / Wikimedia Commons, CC BY 2.0",
    title: "Comedor de la Casa Farnsworth — Ludwig Mies van der Rohe, 1951",
    subtitle: "Plano, Illinois — cuero y acero cromado",
  },
  {
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/0d/Wassily_Chair_by_Marcel_Breuer%2C_reproduction%2C_1925%2C_chrome_covered_steel_and_belting_leather_-_University_of_Arizona_Museum_of_Art_-_University_of_Arizona_-_Tucson%2C_AZ_-_DSC08029.jpg",
    imageAlt:
      "Silla Wassily de Marcel Breuer, correas de cuero rojo sobre estructura de tubo de acero cromado",
    imageCredit: "Foto: Daderot / Wikimedia Commons, dominio público (CC0)",
    title: "Wassily Chair — Marcel Breuer, 1925",
    subtitle: "Bauhaus, Dessau — cuero y acero tubular",
  },
  {
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/e/e8/Ngv_design%2C_charles_eames_and_herman_miller%2C_lounge_chair_670%2C_1956.JPG",
    imageAlt:
      "Eames Lounge Chair, cáscaras de contrachapado, tapizado en cuero oscuro y base giratoria de aluminio",
    imageCredit: "Foto: Sailko / Wikimedia Commons, CC BY-SA 3.0",
    title: "Eames Lounge Chair — Charles & Ray Eames, 1956",
    subtitle: "Cuero y aluminio",
  },
  {
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/b/b2/Huize_Sonneveld%2C_Eetkamer.jpg",
    imageAlt:
      "Comedor completo de Huis Sonneveld en Róterdam, con mesa y sillas de acero tubular cromado diseñadas por W. H. Gispen",
    imageCredit: "Foto: Davidh820 / Wikimedia Commons, CC BY-SA 4.0",
    title: "Comedor de Huis Sonneveld — W. H. Gispen, 1933",
    subtitle: "Róterdam — acero tubular cromado",
  },
  {
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/5/59/Ngv_design%2C_ludwig_mies_van_der_rohe_%26_co%2C_barcelona_chair.JPG",
    imageAlt:
      "Silla Barcelona de Ludwig Mies van der Rohe, cuero negro acolchado y estructura de acero cromado",
    imageCredit: "Foto: Sailko / Wikimedia Commons, CC BY-SA 3.0",
    title: "Barcelona Chair — Ludwig Mies van der Rohe, 1929",
    subtitle: "Cuero y acero cromado",
  },
  {
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/2/26/Salle_%C3%A0_manger_de_la_Villa_Cavrois_%C3%A0_Croix.jpg",
    imageAlt:
      "Comedor de la Villa Cavrois: mesa lacada en negro y sillas tapizadas en cuero coñac, junto a un muro de mármol veteado",
    imageCredit: "Foto: JackyM59 / Wikimedia Commons, CC BY-SA 4.0",
    title: "Comedor de la Villa Cavrois — Robert Mallet-Stevens, 1932",
    subtitle: "Croix, Francia — cuero y laca negra",
  },
  {
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/f/fc/Bauhaus_building_-_Wassily_Chairs_by_Marcel_Breuer_%281925_26%29_%283925088681%29.jpg",
    imageAlt:
      "Conjunto de sillones Wassily en cuero rojo y acero cromado, en el edificio histórico de la Bauhaus en Dessau",
    imageCredit: "Foto: Kai 'Oswald' Seidler / Wikimedia Commons, CC BY 2.0",
    title: "Sillones Wassily — Edificio de la Bauhaus, Dessau",
    subtitle: "Marcel Breuer, 1925-26 — cuero y acero cromado",
  },
];

export function Hero() {
  return (
    <section>
      <HeroCarousel slides={HERO_SLIDES} className="h-[60vh] w-full md:h-[78vh]" />
      <Container>
        <div className="grid gap-8 py-14 md:grid-cols-2 md:gap-16 md:py-20">
          <div>
            <p className="text-muted-foreground text-sm uppercase tracking-widest">
              Diseño · Antigüedades · Colección
            </p>
            <h1 className="text-foreground mt-4 max-w-lg text-4xl leading-[1.1] md:text-5xl">
              Piezas con historia, seleccionadas con criterio.
            </h1>
          </div>
          <div className="flex flex-col justify-end gap-6">
            <p className="text-muted-foreground max-w-md text-base">
              Un espacio para mobiliario de alta calidad, diseño de autor y
              antigüedades verificadas — cada pieza documentada, cada vendedor
              curado.
            </p>
            <div className="flex gap-4">
              <Button asChild>
                <Link href="/explorar">Explorar piezas</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/vender">Vender una pieza</Link>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
