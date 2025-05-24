import * as kuromoji from 'kuromoji'
import { mkdir, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

type IpadicFeatures = kuromoji.IpadicFeatures
type OutputFormat = 'csv' | 'text'

interface TokenAnalysis {
  surface: string
  basic: string
  pos: string
  reading: string
  position: number
}

interface SummarizedWord {
  basic: string
  pos: string
  reading: string
  count: number
  positions: number[]
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
function summarizeWordOccurrences(words: TokenAnalysis[]): SummarizedWord[] {
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

// Function to convert data to CSV format
function convertToCSV(data: any[], headers: string[]): string {
  const headerRow = headers.join(',')
  const dataRows = data.map((item) =>
    headers.map((header) => `"${item[header]}"`).join(',')
  )
  return [headerRow, ...dataRows].join('\n')
}

// Function to convert data to text format
function convertToText(words: SummarizedWord[]): string {
  return words
    .sort((a, b) => (a.positions[0] ?? 0) - (b.positions[0] ?? 0)) // 初出位置でソート
    .map((word) => word.basic)
    .join(' ')
}

// Function to write output files
async function writeOutput(
  baseName: string,
  words: SummarizedWord[],
  kanjiList: string[],
  format: OutputFormat
) {
  const outDir = 'out'
  if (!existsSync(outDir)) {
    await mkdir(outDir)
  }

  if (format === 'csv') {
    const wordHeaders = ['basic', 'pos', 'reading', 'count', 'positions']
    const kanjiHeaders = ['kanji']

    const wordCSV = convertToCSV(
      words.map((word) => ({
        ...word,
        positions: word.positions.join(';'),
      })),
      wordHeaders
    )

    const kanjiCSV = convertToCSV(
      kanjiList.map((kanji) => ({ kanji })),
      kanjiHeaders
    )

    const wordOutputFile = join(outDir, `${baseName}_words.csv`)
    const kanjiOutputFile = join(outDir, `${baseName}_kanji.csv`)

    await writeFile(wordOutputFile, wordCSV)
    await writeFile(kanjiOutputFile, kanjiCSV)

    console.log('分析が完了しました:')
    console.log(`- 自立語: ${wordOutputFile}`)
    console.log(`- 漢字: ${kanjiOutputFile}`)
  } else {
    const wordOutputFile = join(outDir, `${baseName}_words.txt`)
    const kanjiOutputFile = join(outDir, `${baseName}_kanji.txt`)

    const wordText = convertToText(words)
    const kanjiText = kanjiList.join('') // 区切り文字なしで結合

    await writeFile(wordOutputFile, wordText)
    await writeFile(kanjiOutputFile, kanjiText)

    console.log('分析が完了しました:')
    console.log(`- 自立語: ${wordOutputFile}`)
    console.log(`- 漢字: ${kanjiOutputFile}`)
  }
}

// Main function
async function main() {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2)
    if (args.length < 1) {
      throw new Error('Usage: bun run analyze <input_file> [--format csv|text]')
    }

    const inputFile = args[0]
    if (!inputFile) {
      throw new Error('Input file path is required')
    }

    if (!existsSync(inputFile)) {
      throw new Error(`Input file not found: ${inputFile}`)
    }

    // Parse format option
    const formatArg = args.find((arg) => arg.startsWith('--format='))
    const formatValue = formatArg?.split('=')[1]
    const format = (formatValue || 'csv') as OutputFormat
    if (format !== 'csv' && format !== 'text') {
      throw new Error('Invalid format. Use "csv" or "text"')
    }

    // Read input file
    const text = await Bun.file(inputFile).text()

    // Analyze text
    const result = await analyzeText(text)
    const summarizedWords = summarizeWordOccurrences(result.contentWords)

    // Generate output filename
    const fileName = inputFile.split('/').pop()
    if (!fileName) {
      throw new Error('Invalid input file path')
    }
    const baseName = fileName.split('.')[0] || fileName
    if (!baseName) {
      throw new Error('Invalid file name format')
    }

    // Write output files
    await writeOutput(baseName, summarizedWords, result.kanjiList, format)
  } catch (error) {
    console.error('エラーが発生しました:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

// Run the main function
main()
