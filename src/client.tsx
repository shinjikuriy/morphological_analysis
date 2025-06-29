import { render } from 'preact'
import { useState } from 'preact/hooks'
import { AnalysisForm } from './components/AnalysisForm'
import { AcquiredItemForm } from './components/acquiredItemForm'
import type { AnalysisResult } from './types'

function App() {
  const [formResults, setFormResults] = useState<(AnalysisResult | null)[]>([
    null,
    null,
    null,
  ])
  const [acquiredKanji, setAcquiredKanji] = useState<string[]>([])
  const [acquiredWords, setAcquiredWords] = useState<AnalysisResult | null>(
    null
  )

  const handleResultChange =
    (index: number) => (result: AnalysisResult | null) => {
      setFormResults((prev) => {
        const newResults = [...prev]
        newResults[index] = result
        return newResults
      })
    }

  const handleAcquiredKanjiChange = (kanji: string[]) => {
    setAcquiredKanji(kanji)
  }

  const handleAcquiredWordsChange = (result: AnalysisResult | null) => {
    setAcquiredWords(result)
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
        `}
      </style>
      <h1>Morph Analysis</h1>

      <AcquiredItemForm
        onAcquiredKanjiChange={handleAcquiredKanjiChange}
        onAcquiredWordsChange={handleAcquiredWordsChange}
      />

      {(acquiredKanji.length > 0 || acquiredWords) && (
        <div class='acquired-data-display'>
          <h2>Saved Acquired Data</h2>
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
          {acquiredWords && (
            <div>
              <h3>Acquired Words:</h3>
              <div class='acquired-content'>
                {acquiredWords.contentWordList.map((word, wordIndex) => (
                  <span key={wordIndex} style='margin-right: 0.5em;'>
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
    </>
  )
}

render(<App />, document.body)
