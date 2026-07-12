"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export interface HeroSlide {
  imageUrl: string;
  imageAlt: string;
  imageCredit: string;
  title: string;
  subtitle: string;
}

const AUTOPLAY_MS = 6000;

export function HeroCarousel({
  slides,
  className,
}: {
  slides: HeroSlide[];
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [paused, slides.length]);

  return (
    <div
      className={`relative ${className ?? ""}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-full w-full overflow-hidden">
        {slides.map((slide, slideIndex) => (
          <div
            key={slide.imageUrl}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{ opacity: slideIndex === index ? 1 : 0 }}
            aria-hidden={slideIndex !== index}
          >
            <Image
              src={slide.imageUrl}
              alt={slide.imageAlt}
              fill
              sizes="100vw"
              priority={slideIndex === 0}
              className="object-cover"
              // Ver nota en components/trends/trend-card.tsx: fotografía
              // hotlinked de Wikimedia Commons, sin reprocesar en servidor
              // para evitar el rate-limit 429.
              unoptimized
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent pt-16">
              <div className="flex flex-col gap-1 p-4 sm:p-6">
                <p className="text-sm text-white/90">{slide.title}</p>
                <p className="text-xs text-white/70">{slide.subtitle}</p>
                <p className="text-[11px] text-white/50">{slide.imageCredit}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {slides.length > 1 ? (
        <div className="absolute right-4 bottom-4 flex gap-2 sm:right-6 sm:bottom-6">
          {slides.map((slide, slideIndex) => (
            <button
              key={slide.imageUrl}
              type="button"
              aria-label={`Ver fotografía ${slideIndex + 1}`}
              onClick={() => setIndex(slideIndex)}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                slideIndex === index ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
