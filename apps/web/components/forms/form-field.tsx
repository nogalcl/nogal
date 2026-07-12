import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormFieldProps extends React.ComponentProps<"input"> {
  label: string;
}

export function FormField({ label, id, ...props }: FormFieldProps) {
  const fieldId = id ?? props.name;
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={fieldId} className="text-foreground text-sm">
        {label}
      </Label>
      <Input id={fieldId} {...props} />
    </div>
  );
}
