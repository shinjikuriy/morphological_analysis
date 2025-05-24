# Japanese Text Analysis Tool

A command-line tool for analysing Japanese text, extracting content words and kanji using Kuromoji morphological analyser.

## Features

- Extracts content words (nouns, verbs, adjectives, and adverbs)
- Extracts unique kanji characters
- Provides word frequency analysis
- Supports both CSV and text output formats
- Handles file input and output with proper error handling

## Prerequisites

- Node.js (v14 or higher)
- Bun runtime

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd morphological_analysis
```

2. Install dependencies:
```bash
bun install
```

## Usage

```bash
bun run analyze <input_file> [--format=csv|text]
```

### Arguments

- `input_file`: Path to the input text file (required)
- `--format`: Output format (optional, defaults to 'csv')
  - `csv`: Output in CSV format with detailed information
  - `text`: Output in plain text format

### Output Files

The program generates two output files in the `out` directory:

1. Words file (`<filename>_words.csv` or `<filename>_words.txt`)
   - CSV format: Contains basic form, part of speech, reading, count, and positions
   - Text format: Space-separated list of words in their basic form

2. Kanji file (`<filename>_kanji.csv` or `<filename>_kanji.txt`)
   - CSV format: One kanji per line
   - Text format: Continuous string of unique kanji characters

### Example

```bash
# Using CSV format (default)
bun run analyze input.txt

# Using text format
bun run analyze input.txt --format=text
```

## Output Format Details

### CSV Format

Words file columns:
- `basic`: Basic form of the word
- `pos`: Part of speech
- `reading`: Reading in katakana
- `count`: Number of occurrences
- `positions`: Semicolon-separated list of word positions

Kanji file:
- Single column with header 'kanji'

### Text Format

- Words: Space-separated list of words in their basic form
- Kanji: Continuous string of unique kanji characters

## Error Handling

The program handles various error cases:
- Missing input file
- Invalid file format
- Invalid command-line arguments
- Output directory creation failures
