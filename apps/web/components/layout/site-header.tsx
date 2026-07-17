"use client";

import Link from "next/link";
import { Bell, Heart, Menu, MessageCircle, Search, User } from "lucide-react";

import { NogalMark } from "@/components/brand/nogal-mark";
import { Container } from "@/components/layout/container";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useNavCounts } from "@/lib/hooks/use-nav-counts";
import { siteConfig } from "@/lib/site";

const primaryNav = [
  { href: "/explorar", label: "Piezas" },
  { href: "/colecciones", label: "Colecciones" },
  { href: "/tendencias", label: "Tendencias" },
] as const;

function NavBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="bg-foreground text-background absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full text-[10px] leading-none">
      {count > 9 ? "9+" : count}
    </span>
  );
}

/**
 * Los contadores de mensajes/notificaciones se piden desde el cliente tras
 * hidratar (ver /api/nav-counts) en vez de leer cookies aquí o en el layout
 * raíz — así la home y el resto de páginas estáticas no se vuelven
 * dinámicas solo por mostrar un badge. Ver middleware.ts para el resto del
 * enrutado consciente de sesión. useNavCounts sondea periódicamente (ver
 * ese hook y MessageNotifier) para que el badge se sienta "en vivo".
 */
export function SiteHeader() {
  const counts = useNavCounts();

  return (
    <header className="border-border bg-background sticky top-0 z-40 border-b">
      <Container className="flex h-20 items-center justify-between">
        <Link
          href="/"
          className="text-foreground flex items-center gap-3 tracking-tight"
        >
          <NogalMark className="text-primary h-7 w-7" />
          <span className="border-border border-l pl-3 font-serif text-2xl">
            {siteConfig.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-foreground/80 hover:text-foreground text-sm transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Buscar"
            className="hidden md:inline-flex"
            asChild
          >
            <Link href="/explorar">
              <Search className="size-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="hidden md:inline-flex"
            asChild
          >
            <Link href="/vender">Vender una pieza</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Favoritos"
            className="hidden md:inline-flex"
            asChild
          >
            <Link href="/favoritos">
              <Heart className="size-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Mensajes"
            className="relative hidden md:inline-flex"
            asChild
          >
            <Link href="/mensajes">
              <MessageCircle className="size-4" />
              <NavBadge count={counts.unreadMessages} />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notificaciones"
            className="relative hidden md:inline-flex"
            asChild
          >
            <Link href="/notificaciones">
              <Bell className="size-4" />
              <NavBadge count={counts.unreadNotifications} />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Mi cuenta" asChild>
            <Link href="/cuenta">
              <User className="size-4" />
            </Link>
          </Button>
          <ThemeToggle />

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Abrir menú"
                className="md:hidden"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs">
              <SheetHeader>
                <SheetTitle className="font-serif text-xl">
                  {siteConfig.name}
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                {primaryNav.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className="border-border text-foreground border-b py-4 text-base"
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <Link
                    href="/vender"
                    className="text-foreground border-border border-b py-4 text-base"
                  >
                    Vender una pieza
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/favoritos"
                    className="text-foreground border-border border-b py-4 text-base"
                  >
                    Favoritos
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/mensajes"
                    className="text-foreground border-border flex items-center justify-between border-b py-4 text-base"
                  >
                    Mensajes
                    {counts.unreadMessages > 0 ? (
                      <span className="text-muted-foreground text-xs">
                        {counts.unreadMessages}
                      </span>
                    ) : null}
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/notificaciones"
                    className="text-foreground border-border flex items-center justify-between border-b py-4 text-base"
                  >
                    Notificaciones
                    {counts.unreadNotifications > 0 ? (
                      <span className="text-muted-foreground text-xs">
                        {counts.unreadNotifications}
                      </span>
                    ) : null}
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/cuenta"
                    className="text-foreground py-4 text-base"
                  >
                    Mi cuenta
                  </Link>
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  );
}
