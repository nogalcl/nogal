import { Container } from "@/components/layout/container";

export default function Loading() {
  return (
    <Container className="py-16">
      <div className="flex items-start gap-5">
        <div className="bg-muted size-16 animate-pulse rounded-full" />
        <div>
          <div className="bg-muted h-4 w-20 animate-pulse" />
          <div className="bg-muted mt-3 h-8 w-48 animate-pulse" />
        </div>
      </div>
      <div className="bg-muted mt-10 h-24 animate-pulse" />
    </Container>
  );
}
