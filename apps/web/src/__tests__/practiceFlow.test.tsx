import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import App from '../App';

const mockFeedback = [
  {
    level: 'sentence' as const,
    targetText: 'This is a thesis sentence.',
    strengths: ['Clear position statement'],
    issues: ['Could be more specific'],
    revisionHint: 'Add one concrete reason.'
  },
  {
    level: 'sentence' as const,
    targetText: 'This is a supporting sentence.',
    strengths: ['Relevant supporting detail'],
    issues: ['Transition is abrupt'],
    revisionHint: 'Use a linking phrase before this sentence.'
  }
];

describe('practice flow', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    window.localStorage.removeItem('ieltsPrep.v0.1.history');
  });

  test('checks thesis sentence and shows feedback', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ feedback: mockFeedback })
    } as Response);

    render(<App />);

    expect(screen.getByRole('button', { name: 'Thesis drill' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Paragraph drill' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mini essay drill' })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Writing draft'), {
      target: { value: 'This is a thesis sentence.' }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Check sentence' }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mode: 'thesis',
          level: 'sentence',
          text: 'This is a thesis sentence.',
          prompt: 'State your opinion clearly in one sentence.'
        })
      });
    });

    expect(await screen.findByText('Clear position statement')).toBeInTheDocument();
    expect(screen.getByText('Could be more specific')).toBeInTheDocument();
    expect(screen.getByText('Add one concrete reason.')).toBeInTheDocument();
    expect(screen.getByText('Relevant supporting detail')).toBeInTheDocument();
    expect(screen.getByText('Transition is abrupt')).toBeInTheDocument();
    expect(screen.getByText('Use a linking phrase before this sentence.')).toBeInTheDocument();
  });

  test('shows validation error and clears stale feedback for empty draft', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ feedback: mockFeedback })
    } as Response);

    render(<App />);

    const draftField = screen.getByLabelText('Writing draft');

    fireEvent.change(draftField, {
      target: { value: 'This is a thesis sentence.' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Check sentence' }));

    expect(await screen.findByText('Clear position statement')).toBeInTheDocument();

    fireEvent.change(draftField, {
      target: { value: '   ' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Check sentence' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Please write a draft before checking.'
    );
    expect(screen.queryByText('Clear position statement')).not.toBeInTheDocument();
  });

  test('does not show Retry after validation error following successful check', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ feedback: mockFeedback })
    } as Response);

    render(<App />);

    const draftField = screen.getByLabelText('Writing draft');

    fireEvent.change(draftField, {
      target: { value: 'This is a thesis sentence.' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Check sentence' }));

    expect(await screen.findByText('Clear position statement')).toBeInTheDocument();

    fireEvent.change(draftField, {
      target: { value: '' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Check sentence' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Please write a draft before checking.'
    );
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
  });

  test('shows API error and retries the latest feedback request', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: false
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ feedback: mockFeedback })
      } as Response);

    render(<App />);

    fireEvent.change(screen.getByLabelText('Writing draft'), {
      target: { value: 'This is a thesis sentence.' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Check sentence' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Feedback service unavailable'
    );

    expect(screen.getByLabelText('Writing draft')).toHaveValue('This is a thesis sentence.');

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });

    expect(await screen.findByText('Clear position statement')).toBeInTheDocument();
  });

  test('switches mode, clears stale state, and sends check paragraph payload', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ feedback: mockFeedback })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ feedback: mockFeedback })
      } as Response);

    render(<App />);

    const draftField = screen.getByLabelText('Writing draft');

    fireEvent.change(draftField, {
      target: { value: 'This is a thesis sentence.' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Check sentence' }));

    expect(await screen.findByText('Clear position statement')).toBeInTheDocument();

    fireEvent.change(draftField, {
      target: { value: ' ' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Check sentence' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Please write a draft before checking.'
    );

    fireEvent.click(screen.getByRole('button', { name: 'Paragraph drill' }));

    expect(screen.queryByText('Clear position statement')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    fireEvent.change(draftField, {
      target: { value: 'This is a paragraph draft.' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Check paragraph' }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenLastCalledWith('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mode: 'paragraph',
          level: 'paragraph',
          text: 'This is a paragraph draft.',
          prompt: 'Write one focused body paragraph with a clear topic sentence.'
        })
      });
    });
  });

  test('saves a practice record and reloads it from history', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ feedback: mockFeedback })
    } as Response);

    render(<App />);

    const draftField = screen.getByLabelText('Writing draft');

    fireEvent.change(draftField, {
      target: { value: 'Saved thesis draft text.' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Check sentence' }));

    expect(await screen.findByText('Clear position statement')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Save practice' }));

    expect(screen.getByRole('button', { name: 'thesis: Saved thesis draft text.' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Paragraph drill' }));
    fireEvent.change(draftField, {
      target: { value: 'Different draft text.' }
    });

    fireEvent.click(screen.getByRole('button', { name: 'thesis: Saved thesis draft text.' }));

    expect(screen.getByLabelText('Writing draft')).toHaveValue('Saved thesis draft text.');
    expect(screen.getByText('Clear position statement')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Thesis drill' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('State your opinion clearly in one sentence.')).toBeInTheDocument();
  });
});
