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
  const contentWordMap = new Map<
    string,
    {
      positions: number[]
      token: kuromoji.IpadicFeatures
    }
  >()

  tokens.forEach((token, index) => {
    if (['名詞', '動詞', '形容詞'].includes(token.pos)) {
      const basic = token.basic_form || token.surface_form
      const existing = contentWordMap.get(basic)
      if (existing) {
        existing.positions.push(index)
      } else {
        contentWordMap.set(basic, {
          positions: [index],
          token: token,
        })
      }
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
      ([basic, data]) => {
        const token = data.token
        return {
          word_id: token.word_id || 0,
          word_type: token.word_type || 'KNOWN',
          pos: token.pos,
          pos_detail_1: token.pos_detail_1 || '',
          pos_detail_2: token.pos_detail_2 || '',
          pos_detail_3: token.pos_detail_3 || '',
          conjugated_type: token.conjugated_type || '',
          conjugated_form: token.conjugated_form || '',
          basic_form: token.basic_form || token.surface_form,
          reading: token.reading || '',
          pronunciation: token.pronunciation || '',
          basic: basic,
          positions: data.positions,
        } as ContentWord
      }
    ),
    kanjiList: Array.from(kanjiSet).map((kanji) => ({ kanji })),
  }
}
