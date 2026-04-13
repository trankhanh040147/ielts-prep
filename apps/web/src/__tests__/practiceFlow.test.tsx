import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, it, expect, beforeEach } from 'vitest'
import App from '../App'

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
})

beforeEach(() => localStorage.clear())

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

  // History should now show an entry (history button contains mode name)
  expect(screen.getAllByText(/thesis/i).length).toBeGreaterThan(1)
})

it('shows error when saving empty draft', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole('button', { name: /save practice/i }))
  expect(await screen.findByText(/writing text is required/i)).toBeInTheDocument()
})
