import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FeedbackPanel } from '../components/FeedbackPanel'
import type { FeedbackUnit } from '../types'

const unit: FeedbackUnit = {
  level: 'sentence',
  targetText: 'The government should taking action.',
  strengths: ['Clear argument'],
  issues: ['Grammar error'],
  revision: {
    explanation: 'Modal verbs take bare infinitive, not gerund.',
    rewrites: [
      'The government should take action.',
      'The government must take decisive action.',
    ],
  },
}

describe('FeedbackPanel', () => {
  it('renders nothing when feedback is empty', () => {
    const { container } = render(<FeedbackPanel feedback={[]} draft="" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the target text', () => {
    render(<FeedbackPanel feedback={[unit]} draft="" />)
    expect(screen.getByText('The government should taking action.')).toBeInTheDocument()
  })

  it('renders strengths', () => {
    render(<FeedbackPanel feedback={[unit]} draft="" />)
    expect(screen.getByText('Clear argument')).toBeInTheDocument()
  })

  it('renders issues', () => {
    render(<FeedbackPanel feedback={[unit]} draft="" />)
    expect(screen.getByText('Grammar error')).toBeInTheDocument()
  })

  it('renders revision explanation', () => {
    render(<FeedbackPanel feedback={[unit]} draft="" />)
    expect(screen.getByText(/Modal verbs take bare infinitive/)).toBeInTheDocument()
  })

  it('renders rewrite tab buttons', () => {
    render(<FeedbackPanel feedback={[unit]} draft="" />)
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument()
  })

  it('renders multiple feedback units', () => {
    const unit2: FeedbackUnit = {
      ...unit,
      targetText: 'Second sentence here.',
      revision: { explanation: 'Another issue.', rewrites: ['Better second sentence.'] },
    }
    render(<FeedbackPanel feedback={[unit, unit2]} draft="" />)
    expect(screen.getByText('The government should taking action.')).toBeInTheDocument()
    expect(screen.getByText('Second sentence here.')).toBeInTheDocument()
  })

  it('shows diff tokens when targetText is present in draft', () => {
    const draft = 'The government should taking action. It matters.'
    render(<FeedbackPanel feedback={[unit]} draft={draft} />)
    const delEl = document.querySelector('del')
    expect(delEl?.textContent).toContain('taking')
  })
})
