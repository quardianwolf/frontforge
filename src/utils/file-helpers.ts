import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'

export interface FileResult {
  path: string
  created: boolean
  skipped: boolean
  reason?: string
}

export function ensureDir(dirPath: string): void {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true })
  }
}

export function writeFileSafe(filePath: string, content: string, overwrite = false): FileResult {
  const dir = dirname(filePath)
  ensureDir(dir)

  if (existsSync(filePath) && !overwrite) {
    return { path: filePath, created: false, skipped: true, reason: 'File already exists' }
  }

  writeFileSync(filePath, content, 'utf-8')
  return { path: filePath, created: true, skipped: false }
}

export function appendToBarrel(barrelPath: string, exportLine: string): FileResult {
  ensureDir(dirname(barrelPath))

  if (existsSync(barrelPath)) {
    const existing = readFileSync(barrelPath, 'utf-8')
    if (existing.includes(exportLine)) {
      return { path: barrelPath, created: false, skipped: true, reason: 'Export already exists' }
    }
    writeFileSync(barrelPath, existing.trimEnd() + '\n' + exportLine + '\n', 'utf-8')
  } else {
    writeFileSync(barrelPath, exportLine + '\n', 'utf-8')
  }

  return { path: barrelPath, created: true, skipped: false }
}

export function formatResults(results: FileResult[]): string {
  const lines = results.map((r) => {
    if (r.skipped) return `  SKIP ${r.path} (${r.reason})`
    return `  CREATE ${r.path}`
  })
  return lines.join('\n')
}

export function toPascalCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c: string | undefined) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (_, c: string) => c.toUpperCase())
}

export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}
