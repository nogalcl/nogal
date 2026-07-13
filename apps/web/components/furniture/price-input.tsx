import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PriceInputProps {
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}

const THOUSANDS_FORMATTER = new Intl.NumberFormat("es-CL");

/**
 * CLP no usa decimales — se pide como entero de pesos. Un <input type="number">
 * nativo no sirve aquí: el punto se interpreta siempre como separador decimal
 * (109.990 → 109.99), nunca como separador de miles chileno, y el precio
 * termina publicado 1000 veces más bajo. Este campo es texto libre: se
 * muestra formateado con puntos de miles y se guarda como entero de dígitos.
 */
export function PriceInput({ label, value, onChange }: PriceInputProps) {
  const displayValue = value != null ? THOUSANDS_FORMATTER.format(value) : "";

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="price" className="text-foreground text-sm">
        {label}
      </Label>
      <Input
        id="price"
        inputMode="numeric"
        value={displayValue}
        onChange={(event) => {
          const digitsOnly = event.target.value.replace(/\D/g, "");
          onChange(digitsOnly ? Number(digitsOnly) : undefined);
        }}
      />
    </div>
  );
}
