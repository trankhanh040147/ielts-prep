import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, it, expect } from 'vitest'
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
