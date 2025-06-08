import * as kuromoji from 'kuromoji'
import type { AnalysisResult, ContentWord, Kanji } from './types'

// Initialize kuromoji tokenizer
const tokenizer = await new Promise<
  kuromoji.Tokenizer<kuromoji.IpadicFeatures>
>((resolve, reject) => {
  kuromoji
    .builder({ dicPath: 'node_modules/kuromoji/dict' })
    .build((err, tokenizer) => {
      if (err) reject(err)
      resolve(tokenizer)
    })
})

export default function analyze(text: string): AnalysisResult {
  // Tokenize the text
  const tokens = tokenizer.tokenize(text)
  
  // Extract content words (nouns, verbs, adjectives)
  const contentWordMap = new Map<string, number[]>()
  tokens.forEach((token, index) => {
    if (['名詞', '動詞', '形容詞'].includes(token.pos)) {
      const basic = token.basic_form || token.surface_form
      const positions = contentWordMap.get(basic) || []
      positions.push(index)
      contentWordMap.set(basic, positions)
    }
  })

  // Extract kanji
  const kanjiSet = new Set<string>()
  tokens.forEach((token) => {
    const kanjiMatches = token.surface_form.match(/[\u4E00-\u9FFF]/g)
    if (kanjiMatches) {
      kanjiMatches.forEach((kanji) => kanjiSet.add(kanji))
    }
  })

  return {
    tokenList: tokens,
    contentWordList: Array.from(contentWordMap.entries()).map(
      ([basic, positions]) => ({
        basic,
        positions,
      })
    ),
    kanjiList: Array.from(kanjiSet).map((kanji) => ({ kanji })),
  }
}
