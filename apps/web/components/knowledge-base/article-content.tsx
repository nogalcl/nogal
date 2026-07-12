export function ArticleContent({ content }: { content: string }) {
  const paragraphs = content.split(/\n{2,}/).filter(Boolean);
  return (
    <div className="mt-8 flex max-w-2xl flex-col gap-4">
      {paragraphs.map((paragraph, index) => (
        <p
          key={index}
          className="text-foreground text-base leading-relaxed whitespace-pre-line"
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}
