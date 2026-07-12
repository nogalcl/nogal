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
      "https://upload.wikimedia.org/wikipedia/commons/5/59/Ngv_design%2C_ludwig_mies_van_der_rohe_%26_co%2C_barcelona_chair.JPG",
    imageAlt:
      "Silla Barcelona de Ludwig Mies van der Rohe, cuero negro acolchado y estructura de acero cromado",
    imageCredit: "Foto: Sailko / Wikimedia Commons, CC BY-SA 3.0",
    title: "Barcelona Chair — Ludwig Mies van der Rohe, 1929",
    subtitle: "Cuero y acero cromado",
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
                <Link href="/piezas">Explorar piezas</Link>
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
