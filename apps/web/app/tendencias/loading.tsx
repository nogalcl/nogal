import { Container } from "@/components/layout/container";

export default function Loading() {
  return (
    <Container className="py-16">
      <div className="bg-muted h-8 w-40 animate-pulse" />
      <div className="bg-muted mt-4 h-12 w-72 animate-pulse" />
      <div className="bg-muted mt-6 h-16 w-full max-w-2xl animate-pulse" />

      <div className="mt-14 flex flex-col gap-16">
        <div className="bg-muted aspect-3/2 w-full animate-pulse" />
        <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-4">
              <div className="bg-muted aspect-4/5 w-full animate-pulse" />
              <div className="bg-muted h-4 w-24 animate-pulse" />
              <div className="bg-muted h-6 w-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
