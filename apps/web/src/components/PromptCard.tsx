type PromptCardProps = {
  prompt: string;
};

export function PromptCard({ prompt }: PromptCardProps) {
  return (
    <section>
      <h2>Prompt</h2>
      <p>{prompt}</p>
    </section>
  );
}
