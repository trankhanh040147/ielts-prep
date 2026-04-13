interface PromptCardProps {
  prompt: string
}

export function PromptCard({ prompt }: PromptCardProps) {
  return (
    <div>
      <p>{prompt}</p>
    </div>
  )
}
