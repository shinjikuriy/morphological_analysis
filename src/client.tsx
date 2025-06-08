import { render } from 'preact'
import { useState } from 'preact/hooks'
import type { AnalysisResult, Token } from './types'

function App() {
  const [text, setText] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const handleChange = (e: Event) => {
    setText((e.target as HTMLInputElement).value)
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
          .text-input {
            display: block;
            width: 30em;
            height: 10em;
            
          }
          .content-words span + span {
            margin-inline-start: 0.5em;
          }
        `}
      </style>
      <h1>Morph Analysis</h1>
      <div>
        input some text here:
        <form onSubmit={handleSubmit}>
          <textarea class='text-input' value={text} onChange={handleChange} />
          <button type='submit'>analyze</button>
        </form>
        {result && (
          <div className='result'>
            <h2>Content Words</h2>
            <div className='content-words'>
              {result.contentWordList.map((word, index) => (
                <span key={index}>
                  {word.basic}
                </span>
              ))}
            </div>
            <h2>Kanji</h2>
            <div className="kanjis">
              {result.kanjiList.map((kanji, index) => (
                <span key={index}>
                  {kanji.kanji}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

render(<App />, document.body)
