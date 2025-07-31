import { useState, useId, useEffect } from 'preact/hooks'
import type { AnalysisResult, ContentWord } from '../types'

interface AnalysisFormProps {
  onResultChange?: (result: AnalysisResult | null) => void
  learnedKanji?: string[]
  learnedWords?: ContentWord[]
}

export function AnalysisForm({
  onResultChange,
  learnedKanji = [],
  learnedWords = [],
}: AnalysisFormProps) {
  const [text, setText] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [tooltip, setTooltip] = useState<{
    text: string
    x: number
    y: number
  } | null>(null)
  const formId = useId()
  const inputId = useId()

  useEffect(() => {
    onResultChange?.(result)
  }, [result])

  const handleChange = (e: Event) => {
    setText((e.target as HTMLTextAreaElement).value)
  }

  const handleSubmit = (e: Event) => {
    e.preventDefault()
    analyzeText(text)
  }

  const analyzeText = async (text: string) => {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ text }),
    })
    if (response.ok) {
      const data = await response.json()
      console.log(data)

      // Add isLearned property to kanji and content words
      const processedData: AnalysisResult = {
        ...data,
        kanjiList: data.kanjiList.map((kanji: any) => ({
          ...kanji,
          isLearned: learnedKanji.includes(kanji.kanji),
        })),
        contentWordList: data.contentWordList.map((word: any) => ({
          ...word,
          isLearned: learnedWords.some(
            (learnedWord) => learnedWord.basic === word.basic
          ),
        })),
      }

      setResult(processedData)
    } else {
      setResult(null)
    }
  }

  const handleTokenHover = (e: MouseEvent, token: any) => {
    const target = e.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    setTooltip({
      text: JSON.stringify(token, null, 2),
      x: rect.left,
      y: rect.bottom + window.scrollY,
    })
  }

  const handleTokenLeave = () => {
    setTooltip(null)
  }

  return (
    <div class='analysis-form'>
      <form id={formId} onSubmit={handleSubmit}>
        <label for={inputId}>input some text here:</label>
        <textarea
          id={inputId}
          class='text-input'
          value={text}
          onChange={handleChange}
        />
        <button type='submit'>analyze</button>
      </form>
      {result && (
        <div class='result'>
          <h2>Tokens</h2>
          <div class='tokens'>
            {result.tokenList.map((token, index) => (
              <span
                key={index}
                class='token'
                onMouseEnter={(e) => handleTokenHover(e, token)}
                onMouseLeave={handleTokenLeave}
              >
                {token.basic_form}
              </span>
            ))}
          </div>
          <h2>Content Words</h2>
          <div class='content-words'>
            {result.contentWordList.map((word, index) => (
              <span
                key={index}
                style={{
                  backgroundColor: word.isLearned ? '#90EE90' : '#f0f0f0',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  marginRight: '0.5rem',
                }}
              >
                {word.basic}
              </span>
            ))}
          </div>
          <h2>Kanji</h2>
          <div class='kanjis'>
            {result.kanjiList.map((kanji, index) => (
              <span
                key={index}
                style={{
                  backgroundColor: kanji.isLearned ? '#90EE90' : '#f0f0f0',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  marginRight: '0.5rem',
                }}
              >
                {kanji.kanji}
              </span>
            ))}
          </div>
        </div>
      )}
      {tooltip && (
        <div
          class='tooltip'
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  )
}
