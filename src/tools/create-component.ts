import { z } from 'zod'
import { join } from 'node:path'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { detectProject } from '../utils/detect-project.js'
import { writeFileSafe, appendToBarrel, formatResults, toPascalCase, type FileResult } from '../utils/file-helpers.js'
import { webComponentTemplate, webBarrelTemplate } from '../templates/web.js'
import { mobileComponentTemplate, mobileStyleTemplate, mobileBarrelTemplate } from '../templates/mobile.js'

export function registerCreateComponent(server: McpServer): void {
  server.tool(
    'create_component',
    'Create a component inside a feature layer (atoms/molecules/organisms/templates) with proper barrel exports. For mobile, also creates styles.ts with Expo CSS.',
    {
      cwd: z.string().describe('Project root directory path'),
      featureName: z.string().describe('Feature name (e.g., "Landing")'),
      componentName: z.string().describe('Component name in PascalCase (e.g., "HeroSection")'),
      layer: z.enum(['atoms', 'molecules', 'organisms', 'templates']).describe('Atomic design layer'),
      platform: z.enum(['nextjs', 'expo', 'auto']).default('auto').describe('Platform override'),
    },
    async ({ cwd, featureName, componentName, layer, platform: platformArg }) => {
      const info = detectProject(cwd)
      const platform = platformArg === 'auto' ? info.platform : platformArg

      if (platform === 'unknown') {
        return {
          content: [{
            type: 'text',
            text: 'Could not detect platform. Please specify platform as "nextjs" or "expo".',
          }],
        }
      }

      const feature = toPascalCase(featureName)
      const component = toPascalCase(componentName)
      const results: FileResult[] = []

      const componentDir = join(info.featuresPath, feature, 'components', layer, component)
      const layerDir = join(info.featuresPath, feature, 'components', layer)

      if (platform === 'nextjs') {
        // Component file
        results.push(
          writeFileSafe(
            join(componentDir, `${component}.tsx`),
            webComponentTemplate(component, layer)
          )
        )

        // Component barrel
        results.push(
          writeFileSafe(
            join(componentDir, 'index.ts'),
            webBarrelTemplate(component)
          )
        )
      }

      if (platform === 'expo') {
        // Component file
        results.push(
          writeFileSafe(
            join(componentDir, `${component}.tsx`),
            mobileComponentTemplate(component)
          )
        )

        // Styles file
        results.push(
          writeFileSafe(
            join(componentDir, 'styles.ts'),
            mobileStyleTemplate()
          )
        )

        // Component barrel
        results.push(
          writeFileSafe(
            join(componentDir, 'index.ts'),
            mobileBarrelTemplate(component)
          )
        )
      }

      // Update layer barrel export
      const exportLine = `export * from './${component}'`
      results.push(appendToBarrel(join(layerDir, 'index.ts'), exportLine))

      const importPath = `@/features/${feature}/components/${layer}`

      const summary = [
        `Component "${component}" created in ${feature}/${layer}`,
        '',
        'Files:',
        formatResults(results),
        '',
        '⚠️  IMPORT RULE (CRITICAL):',
        `  CORRECT:   import { ${component} } from '${importPath}'`,
        `  WRONG:     import { ${component} } from '../../${layer}/${component}'`,
        `  WRONG:     import { ${component} } from './${component}/${component}'`,
        '',
        '  ALWAYS use @/ path alias with barrel exports. NEVER use relative imports between layers.',
        '',
        '🎨 Use /frontend-design skill when filling in this component.',
        '   Stick to existing design tokens unless user asks for something different.',
      ].join('\n')

      return { content: [{ type: 'text', text: summary }] }
    }
  )
}
