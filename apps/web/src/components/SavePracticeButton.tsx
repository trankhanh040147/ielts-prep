type SavePracticeButtonProps = {
  onSave: () => void;
  disabled?: boolean;
};

export function SavePracticeButton({ onSave, disabled = false }: SavePracticeButtonProps) {
  return (
    <button type="button" onClick={onSave} disabled={disabled}>
      Save practice
    </button>
  );
}
