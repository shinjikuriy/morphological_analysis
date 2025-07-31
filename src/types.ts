import * as kuromoji from 'kuromoji'

export interface Token extends kuromoji.IpadicFeatures {}

export interface ContentWord {
  word_id: number
  word_type: 'KNOWN' | 'UNKNOWN'
  pos: string
  pos_detail_1: string
  pos_detail_2: string
  pos_detail_3: string
  conjugated_type: string
  conjugated_form: string
  basic_form: string
  reading: string
  pronunciation: string
  basic: string
  positions: number[]
  isLearned?: boolean
}

export interface Kanji {
  kanji: string
  isLearned?: boolean
}

export interface AnalysisResult {
  tokenList: Token[]
  contentWordList: ContentWord[]
  kanjiList: Kanji[]
}
