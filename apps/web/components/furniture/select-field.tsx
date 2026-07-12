"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  emptyLabel?: string;
  disabled?: boolean;
}

const NONE_VALUE = "__none__";

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "Selecciona una opción",
  emptyLabel,
  disabled,
}: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-foreground text-sm">{label}</Label>
      <Select
        value={value || undefined}
        onValueChange={(next) => onChange(next === NONE_VALUE ? "" : next)}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {emptyLabel ? (
            <SelectItem value={NONE_VALUE}>{emptyLabel}</SelectItem>
          ) : null}
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
