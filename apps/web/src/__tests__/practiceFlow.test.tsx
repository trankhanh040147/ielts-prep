import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, it, expect, beforeEach } from 'vitest'
import App from '../App'

beforeEach(() => localStorage.clear())

it('runs thesis mode sentence feedback flow', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () =>
      new Response(
        JSON.stringify({
          feedback: [
            {
              level: 'sentence',
              targetText: 'Governments should invest in rail.',
              strengths: ['clear thesis'],
              issues: ['minor grammar'],
              revisionHint: 'tighten verb choices',
            },
          ],
        }),
        { status: 200 },
      ),
    ) as unknown as typeof fetch,
  )

  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole('button', { name: /thesis drill/i }))
  await user.type(screen.getByLabelText(/writing draft/i), 'Governments should invest in rail.')
  await user.click(screen.getByRole('button', { name: /check sentence/i }))

  expect(await screen.findByText(/clear thesis/i)).toBeInTheDocument()

  // Verify the API was called with level: 'sentence'
  const fetchMock = vi.mocked(fetch)
  const callBody = JSON.parse(fetchMock.mock.calls[0][1]?.body as string)
  expect(callBody.level).toBe('sentence')
})

it('saves practice and reloads from history', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () =>
      new Response(
        JSON.stringify({
          feedback: [{ level: 'sentence', targetText: 'text', strengths: ['good'], issues: [], revisionHint: 'fix it' }],
        }),
        { status: 200 },
      ),
    ) as unknown as typeof fetch,
  )

  const user = userEvent.setup()
  render(<App />)

  // Complete a feedback flow
  await user.click(screen.getByRole('button', { name: /thesis drill/i }))
  await user.type(screen.getByLabelText(/writing draft/i), 'My draft text here.')
  await user.click(screen.getByRole('button', { name: /check sentence/i }))
  await screen.findByText(/good/i)

  // Save it
  await user.click(screen.getByRole('button', { name: /save practice/i }))

  // HistoryList renders buttons with "{date} — {mode}" pattern.
  // Find a button whose accessible name contains the em dash separator, which only history entries have.
  const historyEntry = await screen.findByRole('button', { name: /—\s*thesis/i })
  expect(historyEntry).toBeInTheDocument()
})

it('shows error when saving empty draft', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole('button', { name: /save practice/i }))
  expect(await screen.findByText(/writing text is required/i)).toBeInTheDocument()
})

it('shows all three mode buttons', () => {
  render(<App />)
  expect(screen.getByRole('button', { name: /thesis drill/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /paragraph drill/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /mini essay drill/i })).toBeInTheDocument()
})

it('check paragraph button triggers paragraph-level feedback', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () =>
      new Response(
        JSON.stringify({
          feedback: [
            {
              level: 'paragraph',
              targetText: 'test',
              strengths: ['well structured paragraph'],
              issues: [],
              revisionHint: 'none',
            },
          ],
        }),
        { status: 200 },
      ),
    ) as unknown as typeof fetch,
  )

  const user = userEvent.setup()
  render(<App />)
  await user.type(screen.getByLabelText(/writing draft/i), 'Some paragraph text.')
  await user.click(screen.getByRole('button', { name: /check paragraph/i }))
  expect(await screen.findByText(/well structured paragraph/i)).toBeInTheDocument()

  // Verify the API was called with level: 'paragraph'
  const fetchMock = vi.mocked(fetch)
  const callBody = JSON.parse(fetchMock.mock.calls[0][1]?.body as string)
  expect(callBody.level).toBe('paragraph')
})

it('shows error banner and preserves draft when API fails', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response('Server Error', { status: 500 })) as unknown as typeof fetch,
  )

  const user = userEvent.setup()
  render(<App />)
  await user.type(screen.getByLabelText(/writing draft/i), 'My draft.')
  await user.click(screen.getByRole('button', { name: /check sentence/i }))

  expect(await screen.findByRole('alert')).toBeInTheDocument()
  // Draft is preserved
  expect(screen.getByLabelText(/writing draft/i)).toHaveValue('My draft.')
})
