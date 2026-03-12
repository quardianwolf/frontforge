import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { detectProject } from '../utils/detect-project.js'

export function registerProjectInfo(server: McpServer): void {
  server.tool(
    'project_info',
    'Detect project type (Next.js or Expo), folder structure, and current state. Run this first to understand the project before making changes.',
    {
      cwd: z.string().describe('Project root directory path'),
    },
    async ({ cwd }) => {
      const info = detectProject(cwd)

      const platformLabel =
        info.platform === 'nextjs'
          ? 'Next.js (Web)'
          : info.platform === 'expo'
            ? 'Expo / React Native (Mobile)'
            : 'Unknown'

      const lines = [
        `Platform: ${platformLabel}`,
        `Has src/: ${info.hasSrc}`,
        `Features path: ${info.featuresPath}`,
        `Has features/: ${info.hasFeatures}`,
        `Has TypeScript: ${info.hasTypescript}`,
        `Project name: ${info.projectName ?? 'not detected'}`,
        '',
        '--- Styling ---',
        info.platform === 'nextjs'
          ? 'Style system: Tailwind CSS (globals.css @theme tokens, cn() helper)'
          : info.platform === 'expo'
            ? 'Style system: Expo CSS (styles.ts per component, lib/theme.ts for tokens)'
            : 'Style system: Unknown (detect platform first)',
        '',
        '--- Next Steps ---',
      ]

      if (info.platform === 'unknown') {
        lines.push('Could not detect platform. Specify if this is Next.js or Expo.')
      } else if (!info.hasFeatures) {
        lines.push(`Run scaffold_project or create_feature to set up ${info.featuresPath}`)
      } else {
        lines.push('Project structure detected. Use create_feature or create_component to add code.')
      }

      return {
        content: [{ type: 'text', text: lines.join('\n') }],
      }
    }
  )
}
