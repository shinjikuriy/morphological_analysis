import * as kuromoji from 'kuromoji'

type IpadicFeatures = kuromoji.IpadicFeatures

interface TokenAnalysis {
  surface: string
  basic: string
  pos: string
  reading: string
  position: number
}

// Initialize kuromoji tokenizer
const tokenizer = await new Promise<kuromoji.Tokenizer<IpadicFeatures>>(
  (resolve, reject) => {
    kuromoji
      .builder({ dicPath: 'node_modules/kuromoji/dict' })
      .build((err, tokenizer) => {
        if (err) reject(err)
        resolve(tokenizer)
      })
  }
)

// Function to analyze text and extract content words and kanji
async function analyzeText(text: string) {
  // Tokenize the text
  const tokens = tokenizer.tokenize(text)

  // Extract content words (名詞、動詞、形容詞、副詞)
  const contentWords = tokens
    .filter((token: IpadicFeatures) => {
      const pos = token.pos
      return (
        pos === '名詞' || pos === '動詞' || pos === '形容詞' || pos === '副詞'
      )
    })
    .map((token: IpadicFeatures, index: number) => ({
      surface: token.surface_form,
      basic: token.basic_form || token.surface_form,
      pos: token.pos,
      reading: token.reading || '',
      position: index,
    }))

  // Extract kanji using Unicode property escapes
  const kanjiRegex = /\p{Script=Han}/gu
  const kanjiSet = new Set(text.match(kanjiRegex) || [])
  const kanjiList = Array.from(kanjiSet)

  return {
    contentWords,
    kanjiList,
  }
}

// Function to summarize word occurrences
function summarizeWordOccurrences(words: TokenAnalysis[]) {
  const wordMap = new Map<
    string,
    { count: number; pos: string; reading: string; positions: number[] }
  >()

  words.forEach((word) => {
    const key = `${word.basic}_${word.pos}`
    if (wordMap.has(key)) {
      const current = wordMap.get(key)!
      current.count++
      current.positions.push(word.position)
    } else {
      wordMap.set(key, {
        count: 1,
        pos: word.pos,
        reading: word.reading,
        positions: [word.position],
      })
    }
  })

  return Array.from(wordMap.entries()).map(([key, value]) => {
    const [basic, pos] = key.split('_')
    return {
      basic: basic || '',
      pos: pos || '',
      reading: value.reading,
      count: value.count,
      positions: value.positions,
    }
  })
}

// Example usage
const text = 'すもももももももものうちです'
const result = await analyzeText(text)
const summarizedWords = summarizeWordOccurrences(result.contentWords)

console.log('入力テキスト:', text)
console.log('\n自立語:')
summarizedWords.forEach((word) => {
  console.log(
    `- ${word.basic} (${word.pos}, 読み: ${word.reading}) - 出現回数: ${word.count}`
  )
})
console.log('\n漢字:')
result.kanjiList.forEach((kanji: string) => {
  console.log(`- ${kanji}`)
})
