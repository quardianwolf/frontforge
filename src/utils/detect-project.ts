import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export type Platform = 'nextjs' | 'expo' | 'unknown'

export interface ProjectInfo {
  platform: Platform
  hasSrc: boolean
  featuresPath: string
  hasFeatures: boolean
  hasTypescript: boolean
  projectName: string | null
}

export function detectProject(cwd: string): ProjectInfo {
  const hasSrc = existsSync(join(cwd, 'src'))
  const featuresBase = hasSrc ? join(cwd, 'src', 'features') : join(cwd, 'features')
  const hasFeatures = existsSync(featuresBase)

  const platform = detectPlatform(cwd)
  const projectName = detectProjectName(cwd)
  const hasTypescript = existsSync(join(cwd, 'tsconfig.json'))

  return {
    platform,
    hasSrc,
    featuresPath: featuresBase,
    hasFeatures,
    hasTypescript,
    projectName,
  }
}

function detectPlatform(cwd: string): Platform {
  // Check for Expo
  const appJson = join(cwd, 'app.json')
  if (existsSync(appJson)) {
    try {
      const content = JSON.parse(readFileSync(appJson, 'utf-8'))
      if (content.expo) return 'expo'
    } catch {
      // ignore parse errors
    }
  }
  if (existsSync(join(cwd, 'app.config.js')) || existsSync(join(cwd, 'app.config.ts'))) {
    return 'expo'
  }

  // Check for Next.js
  if (
    existsSync(join(cwd, 'next.config.js')) ||
    existsSync(join(cwd, 'next.config.ts')) ||
    existsSync(join(cwd, 'next.config.mjs'))
  ) {
    return 'nextjs'
  }

  // Check package.json dependencies
  const pkgPath = join(cwd, 'package.json')
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies }
      if (allDeps['expo']) return 'expo'
      if (allDeps['next']) return 'nextjs'
    } catch {
      // ignore
    }
  }

  return 'unknown'
}

function detectProjectName(cwd: string): string | null {
  const pkgPath = join(cwd, 'package.json')
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
      return pkg.name || null
    } catch {
      return null
    }
  }
  return null
}
