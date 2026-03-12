import { z } from 'zod'
import { join } from 'node:path'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { detectProject } from '../utils/detect-project.js'
import { writeFileSafe, formatResults, toPascalCase, type FileResult } from '../utils/file-helpers.js'

export function registerCreateStyle(server: McpServer): void {
  server.tool(
    'create_style',
    'Create or update a styles.ts file for a mobile (Expo) component using Expo CSS. Only for Expo projects.',
    {
      cwd: z.string().describe('Project root directory path'),
      featureName: z.string().describe('Feature name (e.g., "Landing")'),
      componentName: z.string().describe('Component name (e.g., "HeroSection")'),
      layer: z.enum(['atoms', 'molecules', 'organisms', 'templates']).describe('Atomic design layer'),
      styles: z
        .record(z.record(z.union([z.string(), z.number()])))
        .describe('Style object. Keys are style names, values are CSS property objects. E.g., {"container": {"flex": 1, "padding": 16}, "title": {"fontSize": 24}}'),
    },
    async ({ cwd, featureName, componentName, layer, styles }) => {
      const info = detectProject(cwd)

      if (info.platform !== 'expo') {
        return {
          content: [{
            type: 'text',
            text: 'create_style is only for Expo/React Native projects. For Next.js, use Tailwind CSS classes directly.',
          }],
        }
      }

      const feature = toPascalCase(featureName)
      const component = toPascalCase(componentName)
      const results: FileResult[] = []

      const stylePath = join(
        info.featuresPath, feature, 'components', layer, component, 'styles.ts'
      )

      // Build style content
      const styleEntries = Object.entries(styles).map(([name, props]) => {
        const propsStr = Object.entries(props)
          .map(([key, value]) => {
            const formattedValue = typeof value === 'string' ? `'${value}'` : value
            return `    ${key}: ${formattedValue},`
          })
          .join('\n')
        return `  ${name}: {\n${propsStr}\n  },`
      })

      const content = `import { css } from 'react-native-css'

export const styles = css.create({
${styleEntries.join('\n')}
})
`

      results.push(writeFileSafe(stylePath, content, true))

      const summary = [
        `Styles created for ${feature}/${layer}/${component}`,
        '',
        'Files:',
        formatResults(results),
        '',
        `Style names: ${Object.keys(styles).join(', ')}`,
        '',
        'Usage in component:',
        `  import { styles } from './styles'`,
        `  <View style={styles.container}>`,
      ].join('\n')

      return { content: [{ type: 'text', text: summary }] }
    }
  )
}
