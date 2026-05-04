import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HistoryList } from '../components/HistoryList'
import type { PracticeRecord } from '../types'

const record: PracticeRecord = {
  id: 'r1',
  mode: 'thesis',
  prompt: 'Some people think governments should spend money on railways.',
  topicName: 'Railways vs Roads',
  draft: 'The government should invest.',
  feedback: [],
  updatedAt: '2026-04-22T10:00:00.000Z',
}

describe('HistoryList', () => {
  it('renders nothing when history is empty', () => {
    const { container } = render(
      <HistoryList history={[]} onSelect={vi.fn()} onRename={vi.fn()} onDelete={vi.fn()} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('shows topicName for each record', () => {
    render(<HistoryList history={[record]} onSelect={vi.fn()} onRename={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Railways vs Roads')).toBeInTheDocument()
  })

  it('clicking the topic name shows an edit input with current value', async () => {
    const user = userEvent.setup()
    render(<HistoryList history={[record]} onSelect={vi.fn()} onRename={vi.fn()} onDelete={vi.fn()} />)
    await user.click(screen.getByText('Railways vs Roads'))
    expect(screen.getByDisplayValue('Railways vs Roads')).toBeInTheDocument()
  })

  it('blurring the input calls onRename with the new value', async () => {
    const user = userEvent.setup()
    const onRename = vi.fn()
    render(<HistoryList history={[record]} onSelect={vi.fn()} onRename={onRename} onDelete={vi.fn()} />)
    await user.click(screen.getByText('Railways vs Roads'))
    const input = screen.getByDisplayValue('Railways vs Roads')
    await user.clear(input)
    await user.type(input, 'New Topic Name')
    await user.tab()
    expect(onRename).toHaveBeenCalledWith('r1', 'New Topic Name')
  })

  it('pressing Enter commits the rename', async () => {
    const user = userEvent.setup()
    const onRename = vi.fn()
    render(<HistoryList history={[record]} onSelect={vi.fn()} onRename={onRename} onDelete={vi.fn()} />)
    await user.click(screen.getByText('Railways vs Roads'))
    const input = screen.getByDisplayValue('Railways vs Roads')
    await user.clear(input)
    await user.type(input, 'Another Name{Enter}')
    expect(onRename).toHaveBeenCalledWith('r1', 'Another Name')
  })

  it('pressing Escape cancels edit without calling onRename', async () => {
    const user = userEvent.setup()
    const onRename = vi.fn()
    render(<HistoryList history={[record]} onSelect={vi.fn()} onRename={onRename} onDelete={vi.fn()} />)
    await user.click(screen.getByText('Railways vs Roads'))
    await user.keyboard('{Escape}')
    expect(onRename).not.toHaveBeenCalled()
    expect(screen.getByText('Railways vs Roads')).toBeInTheDocument()
  })

  it('clicking the delete button calls onDelete with the record id', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    render(
      <HistoryList history={[record]} onSelect={vi.fn()} onRename={vi.fn()} onDelete={onDelete} />
    )
    await user.click(screen.getByRole('button', { name: /delete/i }))
    expect(onDelete).toHaveBeenCalledWith('r1')
  })

  it('shows word count, overall band, and attempt labels', () => {
    const older: PracticeRecord = {
      ...record,
      id: 'older',
      draft: 'one two three',
      updatedAt: '2026-04-22T09:00:00.000Z',
      bandEstimate: {
        overall: 6,
        taskAchievement: 6,
        coherenceCohesion: 6,
        lexicalResource: 6,
        grammaticalRangeAccuracy: 6,
        summary: 'ok',
      },
    }
    const newer: PracticeRecord = {
      ...record,
      id: 'newer',
      draft: 'one two three four',
      updatedAt: '2026-04-22T10:00:00.000Z',
      bandEstimate: {
        overall: 6.5,
        taskAchievement: 6,
        coherenceCohesion: 6.5,
        lexicalResource: 7,
        grammaticalRangeAccuracy: 6,
        summary: 'better',
      },
    }

    render(<HistoryList history={[newer, older]} onSelect={vi.fn()} onRename={vi.fn()} onDelete={vi.fn()} />)

    expect(screen.getByText('Attempt 2')).toBeInTheDocument()
    expect(screen.getByText('Attempt 1')).toBeInTheDocument()
    expect(screen.getByText('4 words')).toBeInTheDocument()
    expect(screen.getByText('Band 6.5')).toBeInTheDocument()
  })
})
