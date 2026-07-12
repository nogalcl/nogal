import { Container } from "@/components/layout/container";

export default function Loading() {
  return (
    <div>
      <Container className="pt-16">
        <div className="bg-muted h-4 w-64 animate-pulse" />
        <div className="mt-8 max-w-3xl">
          <div className="bg-muted h-4 w-32 animate-pulse" />
          <div className="bg-muted mt-3 h-12 w-full animate-pulse" />
          <div className="bg-muted mt-6 h-20 w-full animate-pulse" />
        </div>
      </Container>
      <div className="bg-muted mt-10 aspect-3/2 w-full animate-pulse sm:aspect-video" />
      <Container className="pb-20">
        <div className="mt-10 flex max-w-2xl flex-col gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-muted h-4 w-full animate-pulse" />
          ))}
        </div>
      </Container>
    </div>
  );
}
