import { useState } from 'preact/hooks'
import type { AnalysisResult } from '../types'

interface AcquiredItemFormProps {
  onAcquiredKanjiChange: (kanji: string[]) => void
  onAcquiredWordsChange: (result: AnalysisResult | null) => void
}

export function AcquiredItemForm({
  onAcquiredKanjiChange,
  onAcquiredWordsChange,
}: AcquiredItemFormProps) {
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

    onAcquiredKanjiChange(kanjiArray)
    setKanjiInput('') // Clear the input after saving
  }

  const handleWordsSubmit = async (e: Event) => {
    e.preventDefault()

    if (!wordsInput.trim()) {
      onAcquiredWordsChange(null)
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
        onAcquiredWordsChange(result)
      } else {
        console.error('Failed to analyze text')
        onAcquiredWordsChange(null)
      }
    } catch (error) {
      console.error('Error analyzing text:', error)
      onAcquiredWordsChange(null)
    }
  }

  return (
    <div class='acquired-forms-container'>
      <div class='acquired-form'>
        <h3>Acquired Kanji</h3>
        <form onSubmit={handleKanjiSubmit}>
          <textarea
            class='text-input'
            placeholder='Enter acquired kanji...'
            value={kanjiInput}
            onInput={(e) =>
              setKanjiInput((e.target as HTMLTextAreaElement).value)
            }
          />
          <button type='submit'>Save Acquired Kanji</button>
        </form>
      </div>

      <div class='acquired-form'>
        <h3>Acquired Words</h3>
        <form onSubmit={handleWordsSubmit}>
          <textarea
            class='text-input'
            placeholder='Enter acquired words...'
            value={wordsInput}
            onInput={(e) =>
              setWordsInput((e.target as HTMLTextAreaElement).value)
            }
          />
          <button type='submit'>Save Acquired Words</button>
        </form>
      </div>
    </div>
  )
}
