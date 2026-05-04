import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useState } from 'react'
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

beforeEach(() => {
  vi.clearAllMocks()
})

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

  it('shows custom topic textarea when Use custom topic is clicked', async () => {
    const user = userEvent.setup()
    render(<TopicPicker {...baseProps} />)
    await user.click(screen.getByRole('button', { name: /use custom topic/i }))
    expect(screen.getByLabelText(/custom ielts task 2 topic/i)).toBeInTheDocument()
  })

  it('typing custom topic updates prompt and derives topic name', async () => {
    const user = userEvent.setup()
    const onTopicChange = vi.fn()
    render(<TopicPicker {...baseProps} onTopicChange={onTopicChange} />)
    await user.click(screen.getByRole('button', { name: /use custom topic/i }))
    await user.type(screen.getByLabelText(/custom ielts task 2 topic/i), 'Some people believe public transport should be free.')
    expect(onTopicChange).toHaveBeenLastCalledWith(
      'Some people believe public transport should be free.',
      'Some people believe public transport',
    )
  })

  it('does not overwrite manually edited session name while custom topic changes', async () => {
    const user = userEvent.setup()
    const onTopicChange = vi.fn()

    function Harness() {
      const [prompt, setPrompt] = useState(baseProps.prompt)
      const [topicName, setTopicName] = useState(baseProps.topicName)
      return (
        <TopicPicker
          {...baseProps}
          prompt={prompt}
          topicName={topicName}
          onTopicChange={(nextPrompt, nextTopicName) => {
            onTopicChange(nextPrompt, nextTopicName)
            setPrompt(nextPrompt)
            setTopicName(nextTopicName)
          }}
        />
      )
    }

    render(<Harness />)
    await user.click(screen.getByRole('button', { name: /use custom topic/i }))
    await user.clear(screen.getByLabelText('Session name'))
    await user.type(screen.getByLabelText('Session name'), 'My Custom Label')
    await user.type(screen.getByLabelText(/custom ielts task 2 topic/i), ' New prompt text')
    expect(onTopicChange).toHaveBeenLastCalledWith(expect.stringContaining('New prompt text'), 'My Custom Label')
  })
})
