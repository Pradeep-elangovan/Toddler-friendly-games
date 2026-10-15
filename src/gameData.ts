export const iconNames = [
  'pencil',
  'iceCream',
  'star',
  'heart',
  'apple',
  'moon',
  'flower',
  'rocket',
  'cloud',
  'book',
  'rainbow',
]

export const levels = Array.from({ length: 10 }).map((_, i) => ({
  level: i + 1,
  correctCount: i + 1,
  optionsCount: i + 2, // correct + 1
}))

export const cards = [
  {
    id: 'pattern',
    label: 'Pattern Match',
    icons: ['star', 'heart', 'pencil'],
    playable: true,
  },
  {
    id: 'colors',
    label: 'Color Pairs',
    icons: ['rainbow', 'cloud', 'flower'],
    playable: false,
  },
  {
    id: 'sounds',
    label: 'Sound Match',
    icons: ['apple', 'moon', 'book'],
    playable: false,
  },
]
