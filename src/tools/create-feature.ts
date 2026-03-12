import { z } from 'zod'
import { join } from 'node:path'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { detectProject } from '../utils/detect-project.js'
import { ensureDir, writeFileSafe, formatResults, toPascalCase, type FileResult } from '../utils/file-helpers.js'

export function registerCreateFeature(server: McpServer): void {
  server.tool(
    'create_feature',
    'Create a new feature directory with Atomic Design structure (atoms/, molecules/, organisms/, templates/, hooks/, api/, types/). Each layer gets a barrel index.ts.',
    {
      cwd: z.string().describe('Project root directory path'),
      featureName: z.string().describe('Feature name in PascalCase (e.g., "Landing", "Dashboard", "Profile")'),
      layers: z
        .array(z.enum(['atoms', 'molecules', 'organisms', 'templates', 'hooks', 'api', 'types', 'utils', 'stores']))
        .default(['atoms', 'molecules', 'organisms', 'templates', 'hooks', 'api', 'types'])
        .describe('Which subdirectories to create'),
    },
    async ({ cwd, featureName, layers }) => {
      const info = detectProject(cwd)
      const name = toPascalCase(featureName)

      const featureBase = join(info.featuresPath, name)
      const results: FileResult[] = []

      // Determine if components are nested under components/ dir
      const componentLayers = ['atoms', 'molecules', 'organisms', 'templates']
      const nonComponentLayers = layers.filter((l) => !componentLayers.includes(l))
      const activeComponentLayers = layers.filter((l) => componentLayers.includes(l))

      // Create component layer directories with barrel exports
      for (const layer of activeComponentLayers) {
        const layerPath = join(featureBase, 'components', layer)
        ensureDir(layerPath)
        results.push(
          writeFileSafe(join(layerPath, 'index.ts'), `// ${name} ${layer} barrel exports\n`)
        )
      }

      // Create non-component directories
      for (const layer of nonComponentLayers) {
        ensureDir(join(featureBase, layer))
      }

      // Create feature root barrel export
      const exportLines: string[] = []
      for (const layer of activeComponentLayers) {
        exportLines.push(`export * from './components/${layer}'`)
      }
      if (layers.includes('hooks')) {
        exportLines.push(`// export * from './hooks'`)
      }
      if (layers.includes('api')) {
        exportLines.push(`// export * from './api'`)
      }

      results.push(
        writeFileSafe(join(featureBase, 'index.ts'), exportLines.join('\n') + '\n')
      )

      const summary = [
        `Feature "${name}" created at ${featureBase}`,
        '',
        'Structure:',
        `  ${name}/`,
        ...activeComponentLayers.map((l) => `    components/${l}/  (+ index.ts)`),
        ...nonComponentLayers.map((l) => `    ${l}/`),
        `    index.ts  (barrel export)`,
        '',
        'Files:',
        formatResults(results),
        '',
        'Next steps:',
        `  Use create_component to add components to ${name}`,
      ].join('\n')

      return { content: [{ type: 'text', text: summary }] }
    }
  )
}
