import { render } from 'preact'
import { useState, useId } from 'preact/hooks'
import type { AnalysisResult } from './types'

function App() {
  const [text, setText] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const formId = useId()
  const inputId = useId()

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
      setResult(data)
    } else {
      setResult(null)
    }
  }

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
            width: 30em;
            height: 10em;
            
          }
        `}
      </style>
      <h1>Morph Analysis</h1>
      <div>
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
                <span key={index}>{token.basic_form}</span>
              ))}
            </div>
            <h2>Content Words</h2>
            <div class='content-words'>
              {result.contentWordList.map((word, index) => (
                <span key={index}>{word.basic}</span>
              ))}
            </div>
            <h2>Kanji</h2>
            <div class='kanjis'>
              {result.kanjiList.map((kanji, index) => (
                <span key={index}>{kanji.kanji}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

render(<App />, document.body)
