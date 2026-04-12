import type { PracticeRecord } from '../types';

type HistoryListProps = {
  history: PracticeRecord[];
  onSelect: (record: PracticeRecord) => void;
};

export function HistoryList({ history, onSelect }: HistoryListProps) {
  return (
    <section>
      <h2>History</h2>
      {history.length === 0 ? <p>No saved practice yet.</p> : null}
      <ul>
        {history.map((item) => (
          <li key={item.id}>
            <button type="button" onClick={() => onSelect(item)}>
              {item.mode}: {item.draft}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
