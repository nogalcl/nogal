import { WIZARD_STEPS } from "@/lib/estate-liquidation/constants";

export function WizardSteps({ current }: { current: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-8 gap-y-2">
      {WIZARD_STEPS.map(({ step, label }) => (
        <li
          key={step}
          className={
            step === current
              ? "text-foreground text-sm"
              : step < current
                ? "text-muted-foreground text-sm"
                : "text-muted-foreground/50 text-sm"
          }
        >
          <span className="mr-2 tabular-nums">{step}</span>
          {label}
        </li>
      ))}
    </ol>
  );
}
