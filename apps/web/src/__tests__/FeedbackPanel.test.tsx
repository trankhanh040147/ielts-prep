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
    const { container } = render(<FeedbackPanel feedback={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the target text', () => {
    render(<FeedbackPanel feedback={[unit]} />)
    expect(screen.getByText('The government should taking action.')).toBeInTheDocument()
  })

  it('renders strengths', () => {
    render(<FeedbackPanel feedback={[unit]} />)
    expect(screen.getByText('Clear argument')).toBeInTheDocument()
  })

  it('renders issues', () => {
    render(<FeedbackPanel feedback={[unit]} />)
    expect(screen.getByText('Grammar error')).toBeInTheDocument()
  })

  it('renders revision explanation', () => {
    render(<FeedbackPanel feedback={[unit]} />)
    expect(screen.getByText(/Modal verbs take bare infinitive/)).toBeInTheDocument()
  })

  it('renders all alternative rewrites', () => {
    render(<FeedbackPanel feedback={[unit]} />)
    expect(screen.getByText(/The government should take action\./)).toBeInTheDocument()
    expect(screen.getByText(/The government must take decisive action\./)).toBeInTheDocument()
  })

  it('renders multiple feedback units', () => {
    const unit2: FeedbackUnit = {
      ...unit,
      targetText: 'Second sentence here.',
      revision: { explanation: 'Another issue.', rewrites: ['Better second sentence.'] },
    }
    render(<FeedbackPanel feedback={[unit, unit2]} />)
    expect(screen.getByText('The government should taking action.')).toBeInTheDocument()
    expect(screen.getByText('Second sentence here.')).toBeInTheDocument()
  })
})
