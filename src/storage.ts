import type { AnalysisResult, ContentWord } from './types'

const STORAGE_KEYS = {
  ACQUIRED_KANJI: 'morphological_analysis_acquired_kanji',
  ACQUIRED_WORDS: 'morphological_analysis_acquired_words',
} as const

export function saveAcquiredKanji(kanji: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACQUIRED_KANJI, JSON.stringify(kanji))
  } catch (error) {
    console.error('Failed to save acquired kanji to localStorage:', error)
  }
}

export function appendAcquiredKanji(newKanji: string[]): string[] {
  try {
    const existingKanji = loadAcquiredKanji()
    const combinedKanji = [...existingKanji, ...newKanji]
    const uniqueKanji = [...new Set(combinedKanji)] // Remove duplicates
    saveAcquiredKanji(uniqueKanji)
    return uniqueKanji
  } catch (error) {
    console.error('Failed to append acquired kanji to localStorage:', error)
    return loadAcquiredKanji()
  }
}

export function loadAcquiredKanji(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ACQUIRED_KANJI)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to load acquired kanji from localStorage:', error)
  }
  return []
}

export function saveAcquiredWords(words: ContentWord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACQUIRED_WORDS, JSON.stringify(words))
  } catch (error) {
    console.error('Failed to save acquired words to localStorage:', error)
  }
}

export function loadAcquiredWords(): ContentWord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ACQUIRED_WORDS)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to load acquired words from localStorage:', error)
  }
  return []
}

export function clearAllStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.ACQUIRED_KANJI)
    localStorage.removeItem(STORAGE_KEYS.ACQUIRED_WORDS)
  } catch (error) {
    console.error('Failed to clear localStorage:', error)
  }
}
