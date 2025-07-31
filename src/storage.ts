import type { AnalysisResult, ContentWord } from './types'

const STORAGE_KEYS = {
  ACQUIRED_KANJI: 'morphological_analysis_learned_kanji',
  ACQUIRED_WORDS: 'morphological_analysis_learned_words',
} as const

export function saveLearnedKanji(kanji: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACQUIRED_KANJI, JSON.stringify(kanji))
  } catch (error) {
    console.error('Failed to save learned kanji to localStorage:', error)
  }
}

export function appendLearnedKanji(newKanji: string[]): string[] {
  try {
    const existingKanji = loadLearnedKanji()
    const combinedKanji = [...existingKanji, ...newKanji]
    const uniqueKanji = [...new Set(combinedKanji)] // Remove duplicates
    saveLearnedKanji(uniqueKanji)
    return uniqueKanji
  } catch (error) {
    console.error('Failed to append learned kanji to localStorage:', error)
    return loadLearnedKanji()
  }
}

export function loadLearnedKanji(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ACQUIRED_KANJI)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to load learned kanji from localStorage:', error)
  }
  return []
}

export function saveLearnedWords(words: ContentWord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACQUIRED_WORDS, JSON.stringify(words))
  } catch (error) {
    console.error('Failed to save learned words to localStorage:', error)
  }
}

export function loadLearnedWords(): ContentWord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ACQUIRED_WORDS)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to load learned words from localStorage:', error)
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
