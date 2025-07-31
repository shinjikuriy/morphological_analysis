import { useState } from 'preact/hooks'
import type { AnalysisResult } from '../types'

interface LearnedItemFormProps {
  onLearnedKanjiChange: (kanji: string[]) => void
  onLearnedWordsChange: (result: AnalysisResult | null) => void
}

export function LearnedItemForm({
  onLearnedKanjiChange,
  onLearnedWordsChange,
}: LearnedItemFormProps) {
  const [kanjiInput, setKanjiInput] = useState('')
  const [wordsInput, setWordsInput] = useState('')

  const handleKanjiSubmit = (e: Event) => {
    e.preventDefault()
    // Split the input string into individual characters
    const characters = kanjiInput.split('')

    // Filter CJK Unified Ideographs using Unicode property \p{Han}
    const kanjiRegex = /\p{Script=Han}/u

    const kanjiArray = characters
      .filter((char) => char.trim() !== '') // Remove empty strings
      .filter((char) => kanjiRegex.test(char)) // Filter CJK characters only
      .filter((char, index, array) => array.indexOf(char) === index) // Remove duplicates

    onLearnedKanjiChange(kanjiArray)
    setKanjiInput('') // Clear the input after saving
  }

  const handleWordsSubmit = async (e: Event) => {
    e.preventDefault()

    if (!wordsInput.trim()) {
      onLearnedWordsChange(null)
      return
    }

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: wordsInput }),
      })

      if (response.ok) {
        const result: AnalysisResult = await response.json()
        onLearnedWordsChange(result)
      } else {
        console.error('Failed to analyze text')
        onLearnedWordsChange(null)
      }
    } catch (error) {
      console.error('Error analyzing text:', error)
      onLearnedWordsChange(null)
    }
  }

  return (
    <div class='learned-forms-container'>
      <div class='learned-form'>
        <h3>Learned Kanji</h3>
        <form onSubmit={handleKanjiSubmit}>
          <textarea
            class='text-input'
            placeholder='Enter learned kanji...'
            value={kanjiInput}
            onInput={(e) =>
              setKanjiInput((e.target as HTMLTextAreaElement).value)
            }
          />
          <button type='submit'>Save Learned Kanji</button>
        </form>
      </div>

      <div class='learned-form'>
        <h3>Learned Words</h3>
        <form onSubmit={handleWordsSubmit}>
          <textarea
            class='text-input'
            placeholder='Enter learned words...'
            value={wordsInput}
            onInput={(e) =>
              setWordsInput((e.target as HTMLTextAreaElement).value)
            }
          />
          <button type='submit'>Save Learned Words</button>
        </form>
      </div>
    </div>
  )
}
