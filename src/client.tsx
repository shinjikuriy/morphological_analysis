import { render } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { AnalysisForm } from './components/AnalysisForm'
import type { AnalysisResult, ContentWord } from './types'
import { LearnedItemForm } from './components/LearnedItemForm'
import {
  saveLearnedKanji,
  appendLearnedKanji,
  loadLearnedKanji,
  saveLearnedWords,
  loadLearnedWords,
  clearAllStorage,
} from './storage'

function App() {
  const [formResults, setFormResults] = useState<(AnalysisResult | null)[]>([
    null,
    null,
    null,
  ])
  const [learnedKanji, setLearnedKanji] = useState<string[]>([])
  const [learnedWords, setLearnedWords] = useState<ContentWord[]>([])
  const [tooltip, setTooltip] = useState<{
    text: string
    x: number
    y: number
  } | null>(null)

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedKanji = loadLearnedKanji()
    const savedWords = loadLearnedWords()

    if (savedKanji.length > 0) {
      setLearnedKanji(savedKanji)
    }
    if (savedWords) {
      setLearnedWords(savedWords)
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

  const handleLearnedKanjiChange = (kanji: string[]) => {
    const updatedKanji = appendLearnedKanji(kanji)
    setLearnedKanji(updatedKanji)
  }

  const handleLearnedWordsChange = (result: AnalysisResult | null) => {
    if (result) {
      setLearnedWords(result.contentWordList)
      saveLearnedWords(result.contentWordList)
    } else {
      setLearnedWords([])
      saveLearnedWords([])
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
    contentWords: new Map<string, boolean>(),
    kanjis: new Map<string, boolean>(),
  }

  formResults.forEach((result) => {
    if (result) {
      result.contentWordList.forEach((word) => {
        // If word already exists, keep the learned status if either is learned
        const existingLearned =
          aggregatedResults.contentWords.get(word.basic) || false
        aggregatedResults.contentWords.set(
          word.basic,
          existingLearned || word.isLearned || false
        )
      })
      result.kanjiList.forEach((kanji) => {
        // If kanji already exists, keep the learned status if either is learned
        const existingLearned =
          aggregatedResults.kanjis.get(kanji.kanji) || false
        aggregatedResults.kanjis.set(
          kanji.kanji,
          existingLearned || kanji.isLearned || false
        )
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
          .learned-forms-container {
            display: flex;
            gap: 2rem;
            padding: 1rem;
            margin-bottom: 2rem;
          }
          .learned-form {
            flex: 1;
            min-width: 0;
            padding: 1rem;
            border: 1px solid #ccc;
            border-radius: 4px;
          }
          .learned-form h3 {
            margin-top: 0;
            margin-bottom: 1rem;
          }
          .learned-form button {
            margin-top: 0.5rem;
            padding: 0.5rem 1rem;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
          .learned-form button:hover {
            background: #0056b3;
          }
          .learned-data-display {
            margin-top: 2rem;
            padding: 1rem;
            border-top: 2px solid #ccc;
          }
          .learned-data-display h2 {
            margin-top: 1rem;
          }
          .learned-content {
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

      <LearnedItemForm
        onLearnedKanjiChange={handleLearnedKanjiChange}
        onLearnedWordsChange={handleLearnedWordsChange}
      />

      {(learnedKanji.length > 0 || learnedWords.length > 0) && (
        <div class='learned-data-display'>
          <div style='display: flex; justify-content: space-between; align-items: center;'>
            <h2>Saved Learned Data</h2>
            <button
              onClick={() => {
                clearAllStorage()
                setLearnedKanji([])
                setLearnedWords([])
              }}
              class='clear-button'
            >
              Clear All Data
            </button>
          </div>
          {learnedKanji.length > 0 && (
            <div>
              <h3>Learned Kanji:</h3>
              <div class='learned-content'>
                {learnedKanji.map((kanji, index) => (
                  <span key={index} style='margin-right: 0.5em;'>
                    {kanji}
                  </span>
                ))}
              </div>
            </div>
          )}
          {learnedWords.length > 0 && (
            <div>
              <h3>Learned Words:</h3>
              <div class='learned-content'>
                {learnedWords.map((word: ContentWord, wordIndex: number) => (
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
        <AnalysisForm
          onResultChange={handleResultChange(0)}
          learnedKanji={learnedKanji}
          learnedWords={learnedWords}
        />
        <AnalysisForm
          onResultChange={handleResultChange(1)}
          learnedKanji={learnedKanji}
          learnedWords={learnedWords}
        />
        <AnalysisForm
          onResultChange={handleResultChange(2)}
          learnedKanji={learnedKanji}
          learnedWords={learnedWords}
        />
      </div>
      <div class='aggregated-results'>
        <h2>Aggregated Content Words</h2>
        <div class='content-words'>
          {Array.from(aggregatedResults.contentWords.entries()).map(
            ([word, isLearned], index) => (
              <span
                key={index}
                style={{
                  backgroundColor: isLearned ? '#90EE90' : '#f0f0f0',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  marginRight: '0.5rem',
                }}
              >
                {word}
              </span>
            )
          )}
        </div>
        <h2>Aggregated Kanji</h2>
        <div class='kanjis'>
          {Array.from(aggregatedResults.kanjis.entries()).map(
            ([kanji, isLearned], index) => (
              <span
                key={index}
                style={{
                  backgroundColor: isLearned ? '#90EE90' : '#f0f0f0',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  marginRight: '0.5rem',
                }}
              >
                {kanji}
              </span>
            )
          )}
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
