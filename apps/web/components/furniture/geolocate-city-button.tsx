"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GeolocateCityButtonProps {
  onDetected: (city: string) => void;
}

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
}

/**
 * Usa la geolocalización del navegador (GPS en celular) + reverse geocoding
 * de OpenStreetMap/Nominatim para autocompletar la ciudad — Nogal solo
 * opera en Chile, así que no hace falta pedir país, solo la comuna/ciudad.
 */
export function GeolocateCityButton({ onDetected }: GeolocateCityButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (!("geolocation" in navigator)) {
      setError("Tu navegador no soporta geolocalización.");
      return;
    }

    setError(null);
    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=12&addressdetails=1`,
          );
          if (!response.ok) throw new Error("reverse geocoding failed");
          const data: { address?: NominatimAddress } = await response.json();
          const city =
            data.address?.city ??
            data.address?.town ??
            data.address?.village ??
            data.address?.municipality ??
            data.address?.county;

          if (!city) {
            setError("No pudimos identificar tu ciudad. Escríbela a mano.");
          } else {
            onDetected(city);
          }
        } catch {
          setError("No pudimos identificar tu ciudad. Escríbela a mano.");
        } finally {
          setIsLoading(false);
        }
      },
      () => {
        setError("No pudimos acceder a tu ubicación. Escríbela a mano.");
        setIsLoading(false);
      },
      { timeout: 10_000 },
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        disabled={isLoading}
        className="self-start"
      >
        <MapPin className="size-4" />
        {isLoading ? "Ubicando…" : "Usar mi ubicación"}
      </Button>
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </div>
  );
}
