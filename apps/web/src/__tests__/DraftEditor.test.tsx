import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DraftEditor } from '../components/DraftEditor'

describe('DraftEditor', () => {
  it('shows 0 words for an empty draft', () => {
    render(<DraftEditor draft="" onChange={vi.fn()} />)
    expect(screen.getByText('0 words')).toBeInTheDocument()
  })

  it('shows singular word count', () => {
    render(<DraftEditor draft="Education." onChange={vi.fn()} />)
    expect(screen.getByText('1 word')).toBeInTheDocument()
  })

  it('shows plural word count', () => {
    render(<DraftEditor draft="Online education improves access." onChange={vi.fn()} />)
    expect(screen.getByText('4 words')).toBeInTheDocument()
  })
})
