import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RewriteDiff } from '../components/RewriteDiff'

const baseProps = {
  targetText: 'The government should taking action.',
  rewrites: [
    'The government should take action.',
    'The government must take decisive action.',
  ],
  draft: 'Background sentence. The government should taking action. Next sentence.',
}

describe('RewriteDiff', () => {
  it('returns null when rewrites is empty', () => {
    const { container } = render(
      <RewriteDiff targetText="foo" rewrites={[]} draft="" />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders one tab button per rewrite', () => {
    render(<RewriteDiff {...baseProps} />)
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument()
  })

  it('first tab is active (aria-pressed=true) by default', () => {
    render(<RewriteDiff {...baseProps} />)
    expect(screen.getByRole('button', { name: '1' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('clicking tab 2 sets it as active', async () => {
    const user = userEvent.setup()
    render(<RewriteDiff {...baseProps} />)
    await user.click(screen.getByRole('button', { name: '2' }))
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '1' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('shows removed token (del) for the changed word in rewrite 1', () => {
    render(<RewriteDiff {...baseProps} />)
    const delEl = document.querySelector('del')
    expect(delEl?.textContent).toContain('taking')
  })

  it('shows added token (ins) for the changed word in rewrite 1', () => {
    render(<RewriteDiff {...baseProps} />)
    const insEl = document.querySelector('ins')
    expect(insEl?.textContent).toContain('take')
  })

  it('shows surrounding draft context when targetText is found', () => {
    render(<RewriteDiff {...baseProps} />)
    expect(screen.getByText(/Background sentence\./)).toBeInTheDocument()
  })

  it('does not crash when targetText is not in draft', () => {
    expect(() =>
      render(
        <RewriteDiff
          {...baseProps}
          draft="Completely unrelated text with no match."
        />
      )
    ).not.toThrow()
    // Diff still renders without context
    const delEl = document.querySelector('del')
    expect(delEl?.textContent).toContain('taking')
  })
})
