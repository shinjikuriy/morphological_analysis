import { render } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { AnalysisForm } from './components/AnalysisForm'
import type { AnalysisResult, ContentWord } from './types'
import { AcquiredItemForm } from './components/AcquiredItemForm'
import {
  saveAcquiredKanji,
  appendAcquiredKanji,
  loadAcquiredKanji,
  saveAcquiredWords,
  loadAcquiredWords,
  clearAllStorage,
} from './storage'

function App() {
  const [formResults, setFormResults] = useState<(AnalysisResult | null)[]>([
    null,
    null,
    null,
  ])
  const [acquiredKanji, setAcquiredKanji] = useState<string[]>([])
  const [acquiredWords, setAcquiredWords] = useState<ContentWord[]>([])
  const [tooltip, setTooltip] = useState<{
    text: string
    x: number
    y: number
  } | null>(null)

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedKanji = loadAcquiredKanji()
    const savedWords = loadAcquiredWords()

    if (savedKanji.length > 0) {
      setAcquiredKanji(savedKanji)
    }
    if (savedWords) {
      setAcquiredWords(savedWords)
    }
  }, [])

  const handleResultChange =
    (index: number) => (result: AnalysisResult | null) => {
      setFormResults((prev) => {
        const newResults = [...prev]
        newResults[index] = result
        return newResults
      })
    }

  const handleAcquiredKanjiChange = (kanji: string[]) => {
    const updatedKanji = appendAcquiredKanji(kanji)
    setAcquiredKanji(updatedKanji)
  }

  const handleAcquiredWordsChange = (result: AnalysisResult | null) => {
    if (result) {
      setAcquiredWords(result.contentWordList)
      saveAcquiredWords(result.contentWordList)
    } else {
      setAcquiredWords([])
      saveAcquiredWords([])
    }
  }

  const handleWordHover = (e: MouseEvent, word: any) => {
    const target = e.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    setTooltip({
      text: JSON.stringify(word, null, 2),
      x: rect.left,
      y: rect.bottom + window.scrollY,
    })
  }

  const handleWordLeave = () => {
    setTooltip(null)
  }

  // 集計結果の計算
  const aggregatedResults = {
    contentWords: new Set<string>(),
    kanjis: new Set<string>(),
  }

  formResults.forEach((result) => {
    if (result) {
      result.contentWordList.forEach((word) => {
        aggregatedResults.contentWords.add(word.basic)
      })
      result.kanjiList.forEach((kanji) => {
        aggregatedResults.kanjis.add(kanji.kanji)
      })
    }
  })

  return (
    <>
      <style>
        {`
          .tokens span + span,
          .content-words span + span {
            margin-inline-start: 0.5em;
          }
          .text-input {
            display: block;
            width: 100%;
            height: 10em;
          }
          .token {
            cursor: help;
          }
          .tooltip {
            position: absolute;
            background: #333;
            color: white;
            padding: 0.5em;
            border-radius: 4px;
            font-size: 0.9em;
            z-index: 1000;
            max-width: 300px;
            white-space: pre-wrap;
          }
          .analysis-forms-container {
            display: flex;
            gap: 2rem;
            padding: 1rem;
          }
          .analysis-form {
            flex: 1;
            min-width: 0;
            padding: 1rem;
            border: 1px solid #ccc;
            border-radius: 4px;
          }
          .aggregated-results {
            margin-top: 2rem;
            padding: 1rem;
            border-top: 2px solid #ccc;
          }
          .aggregated-results h2 {
            margin-top: 1rem;
          }
          .aggregated-results .content-words,
          .aggregated-results .kanjis {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
          }
          .aggregated-results span {
            padding: 0.25rem 0.5rem;
            background: #f0f0f0;
            border-radius: 4px;
          }
          .acquired-forms-container {
            display: flex;
            gap: 2rem;
            padding: 1rem;
            margin-bottom: 2rem;
          }
          .acquired-form {
            flex: 1;
            min-width: 0;
            padding: 1rem;
            border: 1px solid #ccc;
            border-radius: 4px;
          }
          .acquired-form h3 {
            margin-top: 0;
            margin-bottom: 1rem;
          }
          .acquired-form button {
            margin-top: 0.5rem;
            padding: 0.5rem 1rem;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
          .acquired-form button:hover {
            background: #0056b3;
          }
          .acquired-data-display {
            margin-top: 2rem;
            padding: 1rem;
            border-top: 2px solid #ccc;
          }
          .acquired-data-display h2 {
            margin-top: 1rem;
          }
          .acquired-content {
            margin-top: 0.5rem;
            padding: 0.5rem;
            background: #f0f0f0;
            border-radius: 4px;
          }
          .clear-button {
            padding: 0.5rem 1rem;
            background: #dc3545;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
          .clear-button:hover {
            background: #c82333;
          }
        `}
      </style>
      <h1>Morph Analysis</h1>

      <AcquiredItemForm
        onAcquiredKanjiChange={handleAcquiredKanjiChange}
        onAcquiredWordsChange={handleAcquiredWordsChange}
      />

      {(acquiredKanji.length > 0 || acquiredWords.length > 0) && (
        <div class='acquired-data-display'>
          <div style='display: flex; justify-content: space-between; align-items: center;'>
            <h2>Saved Acquired Data</h2>
            <button
              onClick={() => {
                clearAllStorage()
                setAcquiredKanji([])
                setAcquiredWords([])
              }}
              class='clear-button'
            >
              Clear All Data
            </button>
          </div>
          {acquiredKanji.length > 0 && (
            <div>
              <h3>Acquired Kanji:</h3>
              <div class='acquired-content'>
                {acquiredKanji.map((kanji, index) => (
                  <span key={index} style='margin-right: 0.5em;'>
                    {kanji}
                  </span>
                ))}
              </div>
            </div>
          )}
          {acquiredWords.length > 0 && (
            <div>
              <h3>Acquired Words:</h3>
              <div class='acquired-content'>
                {acquiredWords.map((word: ContentWord, wordIndex: number) => (
                  <span
                    key={wordIndex}
                    style='margin-right: 0.5em; cursor: help;'
                    onMouseEnter={(e) => handleWordHover(e, word)}
                    onMouseLeave={handleWordLeave}
                  >
                    {word.basic}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div class='analysis-forms-container'>
        <AnalysisForm onResultChange={handleResultChange(0)} />
        <AnalysisForm onResultChange={handleResultChange(1)} />
        <AnalysisForm onResultChange={handleResultChange(2)} />
      </div>
      <div class='aggregated-results'>
        <h2>Aggregated Content Words</h2>
        <div class='content-words'>
          {Array.from(aggregatedResults.contentWords).map((word, index) => (
            <span key={index}>{word}</span>
          ))}
        </div>
        <h2>Aggregated Kanji</h2>
        <div class='kanjis'>
          {Array.from(aggregatedResults.kanjis).map((kanji, index) => (
            <span key={index}>{kanji}</span>
          ))}
        </div>
      </div>
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
    </>
  )
}

render(<App />, document.body)
