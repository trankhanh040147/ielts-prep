type DraftEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export function DraftEditor({ value, onChange }: DraftEditorProps) {
  return (
    <section>
      <label htmlFor="writing-draft">Writing draft</label>
      <textarea
        id="writing-draft"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </section>
  );
}
