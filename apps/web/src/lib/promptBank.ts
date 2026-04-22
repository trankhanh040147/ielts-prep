import type { PracticeMode } from '../types'

export const PROMPT_BANK: Record<PracticeMode, { prompt: string; topicName: string }[]> = {
  thesis: [
    { prompt: 'Some people think governments should spend money on railways rather than roads. Discuss both views and give your opinion.', topicName: 'Railways vs Roads' },
    { prompt: 'Some people believe that unpaid community service should be a compulsory part of high school programmes. To what extent do you agree or disagree?', topicName: 'Compulsory Community Service' },
    { prompt: 'Some argue that the best way to reduce crime is to give longer prison sentences. Others believe there are better methods. Discuss both views and give your opinion.', topicName: 'Crime & Prison Sentences' },
    { prompt: 'Many people think that social media has had a largely negative effect on society. To what extent do you agree or disagree?', topicName: 'Social Media Impact' },
  ],
  paragraph: [
    { prompt: 'Many believe online education is replacing traditional classrooms. To what extent do you agree or disagree?', topicName: 'Online Education' },
    { prompt: 'Some people think that a sense of competition in children should be encouraged. Others believe it is harmful. Discuss both views and give your opinion.', topicName: 'Competition in Children' },
    { prompt: 'It is often argued that zoos are cruel and should be abolished. To what extent do you agree or disagree?', topicName: 'Zoos: Cruel or Beneficial?' },
    { prompt: 'Some people think that physical exercise should be compulsory for all school students every day. Others disagree. Discuss both views and give your opinion.', topicName: 'Compulsory PE in Schools' },
  ],
  miniEssay: [
    { prompt: 'In many countries, young people are moving to cities. What are the causes and effects?', topicName: 'Youth Migration to Cities' },
    { prompt: 'In many countries the number of animals and plants is declining. Why is this happening? How can this issue be addressed?', topicName: 'Declining Biodiversity' },
    { prompt: 'Many people are working longer hours than ever before. What are the reasons for this? What effect does it have on individuals and society?', topicName: 'Overworking Trend' },
    { prompt: 'The number of people who are overweight is increasing in many countries. What are the causes of this? What measures could be taken to address this?', topicName: 'Global Obesity' },
  ],
}
