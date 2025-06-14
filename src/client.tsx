import { render } from 'preact'
import { AnalysisForm } from './components/AnalysisForm'

function App() {
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
        `}
      </style>
      <h1>Morph Analysis</h1>
      <div class='analysis-forms-container'>
        <AnalysisForm />
        <AnalysisForm />
        <AnalysisForm />
      </div>
    </>
  )
}

render(<App />, document.body)
