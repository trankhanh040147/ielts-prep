import { useMemo, useState } from 'react';

import { DraftEditor } from './components/DraftEditor';
import { FeedbackPanel } from './components/FeedbackPanel';
import { HistoryList } from './components/HistoryList';
import { ModePicker } from './components/ModePicker';
import { PromptCard } from './components/PromptCard';
import { SavePracticeButton } from './components/SavePracticeButton';
import { postFeedback } from './lib/api';
import { promptBank } from './lib/promptBank';
import { loadHistory, savePractice } from './lib/storage';
import type { FeedbackLevel, FeedbackRequest, FeedbackUnit, PracticeMode, PracticeRecord } from './types';

const makePracticeId = () => {
  return `practice-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

function App() {
  const [mode, setMode] = useState<PracticeMode>('thesis');
  const [draft, setDraft] = useState('');
  const [feedback, setFeedback] = useState<FeedbackUnit[] | null>(null);
  const [history, setHistory] = useState<PracticeRecord[]>(() => loadHistory());
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<FeedbackRequest | null>(null);

  const prompt = useMemo(() => promptBank[mode], [mode]);

  const handleModeChange = (nextMode: PracticeMode) => {
    setMode(nextMode);
    setFeedback(null);
    setError(null);
    setSaveError(null);
    setLastRequest(null);
  };

  const runFeedbackRequest = async (request: FeedbackRequest) => {
    setLastRequest(null);
    setLoading(true);
    setFeedback(null);
    setError(null);
    setSaveError(null);

    try {
      const nextFeedback = await postFeedback(request);
      setFeedback(nextFeedback);
      setLastRequest(null);
    } catch {
      setError('Feedback service unavailable');
      setFeedback(null);
      setLastRequest(request);
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = async (level: FeedbackLevel) => {
    if (!draft.trim()) {
      setFeedback(null);
      setError('Please write a draft before checking.');
      setLastRequest(null);
      return;
    }

    await runFeedbackRequest({
      mode,
      level,
      text: draft,
      prompt
    });
  };

  const handleRetry = async () => {
    if (!lastRequest) {
      return;
    }

    await runFeedbackRequest(lastRequest);
  };

  const handleSavePractice = () => {
    const nextRecordId = activeRecordId ?? makePracticeId();

    try {
      const nextHistory = savePractice({
        id: nextRecordId,
        mode,
        prompt,
        draft,
        feedback: feedback ?? [],
        updatedAt: new Date().toISOString()
      });

      setHistory(nextHistory);
      setActiveRecordId(nextRecordId);
      setSaveError(null);
    } catch (saveActionError) {
      if (saveActionError instanceof Error) {
        setSaveError(saveActionError.message);
        return;
      }

      setSaveError('Could not save practice right now.');
    }
  };

  const handleHistorySelect = (record: PracticeRecord) => {
    setActiveRecordId(record.id);
    setMode(record.mode);
    setDraft(record.draft);
    setFeedback(record.feedback);
    setError(null);
    setSaveError(null);
    setLastRequest(null);
  };

  return (
    <main>
      <h1>IELTS Writing Practice</h1>
      <ModePicker mode={mode} onChange={handleModeChange} />
      <PromptCard prompt={prompt} />
      <DraftEditor value={draft} onChange={setDraft} />
      <button type="button" onClick={() => void handleCheck('sentence')} disabled={loading}>
        Check sentence
      </button>
      <button type="button" onClick={() => void handleCheck('paragraph')} disabled={loading}>
        Check paragraph
      </button>
      <FeedbackPanel feedback={feedback} loading={loading} error={error} />
      {error && lastRequest ? (
        <button type="button" onClick={() => void handleRetry()} disabled={loading}>
          Retry
        </button>
      ) : null}
      <SavePracticeButton onSave={handleSavePractice} disabled={loading} />
      {saveError ? <p role="alert">{saveError}</p> : null}
      <HistoryList history={history} onSelect={handleHistorySelect} />
    </main>
  );
}

export default App;
