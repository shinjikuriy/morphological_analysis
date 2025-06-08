import * as kuromoji from 'kuromoji'

export interface Token extends kuromoji.IpadicFeatures {}

export interface ContentWord {
  basic: string
  positions: number[]
}

export interface Kanji {
  kanji: string
}

export interface AnalysisResult {
  tokenList: Token[]
  contentWordList: ContentWord[]
  kanjiList: Kanji[]
}
