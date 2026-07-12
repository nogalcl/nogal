"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface CheckboxGroupProps {
  legend: string;
  options: Array<{ value: string; label: string }>;
  values: string[];
  onChange: (values: string[]) => void;
}

export function CheckboxGroup({
  legend,
  options,
  values,
  onChange,
}: CheckboxGroupProps) {
  function toggle(value: string, checked: boolean) {
    onChange(checked ? [...values, value] : values.filter((v) => v !== value));
  }

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-foreground text-sm">{legend}</legend>
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        {options.map((option) => {
          const id = `${legend}-${option.value}`;
          return (
            <div key={option.value} className="flex items-center gap-2">
              <Checkbox
                id={id}
                checked={values.includes(option.value)}
                onCheckedChange={(checked) =>
                  toggle(option.value, checked === true)
                }
              />
              <Label
                htmlFor={id}
                className="text-foreground text-sm font-normal"
              >
                {option.label}
              </Label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
