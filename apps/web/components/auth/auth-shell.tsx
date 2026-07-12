import Link from "next/link";
import { Container } from "@/components/layout/container";

interface AuthShellProps {
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-20">
      <div className="w-full max-w-sm">
        <p className="text-muted-foreground text-sm uppercase tracking-widest">
          {eyebrow}
        </p>
        <h1 className="text-foreground mt-3 text-3xl">{title}</h1>
        {description ? (
          <p className="text-muted-foreground mt-3 text-sm">{description}</p>
        ) : null}

        <div className="mt-10">{children}</div>

        {footer ? (
          <p className="text-muted-foreground mt-8 text-sm">{footer}</p>
        ) : null}
      </div>
    </Container>
  );
}

export function AuthLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="text-foreground underline underline-offset-4">
      {children}
    </Link>
  );
}
