import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TopicPicker } from '../components/TopicPicker'
import * as topicApi from '../lib/topicApi'

const baseProps = {
  mode: 'thesis' as const,
  prompt: 'Some people think governments should spend money on railways rather than roads. Discuss both views and give your opinion.',
  topicName: 'Railways vs Roads',
  onTopicChange: vi.fn(),
}

beforeEach(() => vi.clearAllMocks())

describe('TopicPicker', () => {
  it('renders 4 chip buttons for thesis mode', () => {
    render(<TopicPicker {...baseProps} />)
    expect(screen.getByRole('button', { name: 'Railways vs Roads' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Compulsory Community Service' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Crime & Prison Sentences' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Social Media Impact' })).toBeInTheDocument()
  })

  it('active chip has aria-pressed=true', () => {
    render(<TopicPicker {...baseProps} />)
    expect(screen.getByRole('button', { name: 'Railways vs Roads' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Social Media Impact' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('clicking a chip calls onTopicChange with that entry prompt and name', async () => {
    const user = userEvent.setup()
    const onTopicChange = vi.fn()
    render(<TopicPicker {...baseProps} onTopicChange={onTopicChange} />)
    await user.click(screen.getByRole('button', { name: 'Social Media Impact' }))
    expect(onTopicChange).toHaveBeenCalledWith(
      'Many people think that social media has had a largely negative effect on society. To what extent do you agree or disagree?',
      'Social Media Impact',
    )
  })

  it('Generate button calls generateTopic and passes result to onTopicChange', async () => {
    const user = userEvent.setup()
    const onTopicChange = vi.fn()
    vi.spyOn(topicApi, 'generateTopic').mockResolvedValueOnce({
      prompt: 'AI generated prompt.',
      topicName: 'AI Topic',
    })
    render(<TopicPicker {...baseProps} onTopicChange={onTopicChange} />)
    await user.click(screen.getByRole('button', { name: /generate new/i }))
    expect(onTopicChange).toHaveBeenCalledWith('AI generated prompt.', 'AI Topic')
  })

  it('shows error message when generateTopic fails', async () => {
    const user = userEvent.setup()
    vi.spyOn(topicApi, 'generateTopic').mockRejectedValueOnce(new Error('Network error'))
    render(<TopicPicker {...baseProps} />)
    await user.click(screen.getByRole('button', { name: /generate new/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't generate topic")
  })

  it('session name input shows current topicName', () => {
    render(<TopicPicker {...baseProps} />)
    expect(screen.getByLabelText('Session name')).toHaveValue('Railways vs Roads')
  })

  it('typing in session name calls onTopicChange with same prompt and new name', async () => {
    const user = userEvent.setup()
    const onTopicChange = vi.fn()
    render(<TopicPicker {...baseProps} onTopicChange={onTopicChange} />)
    const input = screen.getByLabelText('Session name')
    await user.clear(input)
    await user.type(input, 'X')
    expect(onTopicChange).toHaveBeenLastCalledWith(baseProps.prompt, expect.stringContaining('X'))
  })
})
