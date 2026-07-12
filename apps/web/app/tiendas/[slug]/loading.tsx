import { Container } from "@/components/layout/container";

export default function Loading() {
  return (
    <div>
      <div className="bg-muted h-56 w-full animate-pulse sm:h-72" />
      <Container className="py-16">
        <div className="bg-muted -mt-16 size-24 animate-pulse rounded-full" />
        <div className="bg-muted mt-6 h-8 w-64 animate-pulse" />
        <div className="bg-muted mt-10 h-24 animate-pulse" />
      </Container>
    </div>
  );
}
