import type { PracticeMode } from '../types';

type ModePickerProps = {
  mode: PracticeMode;
  onChange: (mode: PracticeMode) => void;
};

const modes: Array<{ label: string; value: PracticeMode }> = [
  { label: 'Thesis drill', value: 'thesis' },
  { label: 'Paragraph drill', value: 'paragraph' },
  { label: 'Mini essay drill', value: 'miniEssay' }
];

export function ModePicker({ mode, onChange }: ModePickerProps) {
  return (
    <div aria-label="Practice mode">
      {modes.map((item) => (
        <button
          key={item.value}
          type="button"
          aria-pressed={mode === item.value}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
