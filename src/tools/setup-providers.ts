import { z } from 'zod'
import { join } from 'node:path'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { detectProject } from '../utils/detect-project.js'
import { writeFileSafe, formatResults, type FileResult } from '../utils/file-helpers.js'
import { webQueryProviderTemplate, webLayoutWithProviderTemplate, webCnUtilTemplate, webQueryHookTemplate } from '../templates/web.js'
import { mobileQueryProviderTemplate, mobileRootLayoutTemplate, mobileThemeTemplate, mobileQueryHookTemplate } from '../templates/mobile.js'
import { toPascalCase } from '../utils/file-helpers.js'

export function registerSetupProviders(server: McpServer): void {
  server.tool(
    'setup_query_provider',
    'Create QueryProvider and wire it into the root layout. Also creates utility files (cn() for web, theme.ts for mobile).',
    {
      cwd: z.string().describe('Project root directory path'),
      platform: z.enum(['nextjs', 'expo', 'auto']).default('auto'),
    },
    async ({ cwd, platform: platformArg }) => {
      const info = detectProject(cwd)
      const platform = platformArg === 'auto' ? info.platform : platformArg
      const results: FileResult[] = []
      const base = info.hasSrc ? join(cwd, 'src') : cwd

      if (platform === 'nextjs') {
        results.push(writeFileSafe(join(base, 'lib', 'query-provider.tsx'), webQueryProviderTemplate()))
        results.push(writeFileSafe(join(base, 'lib', 'utils.ts'), webCnUtilTemplate()))
        results.push(writeFileSafe(join(base, 'app', 'layout.tsx'), webLayoutWithProviderTemplate()))
      } else if (platform === 'expo') {
        results.push(writeFileSafe(join(base, 'lib', 'query-provider.tsx'), mobileQueryProviderTemplate()))
        results.push(writeFileSafe(join(base, 'lib', 'theme.ts'), mobileThemeTemplate()))
        results.push(writeFileSafe(join(cwd, 'app', '_layout.tsx'), mobileRootLayoutTemplate()))
      } else {
        return {
          content: [{ type: 'text', text: 'Could not detect platform. Specify "nextjs" or "expo".' }],
        }
      }

      return {
        content: [{
          type: 'text',
          text: [
            `QueryProvider setup for ${platform}`,
            '',
            'Files:',
            formatResults(results),
            '',
            platform === 'nextjs'
              ? 'Install: npm install @tanstack/react-query @tanstack/react-query-devtools clsx tailwind-merge'
              : 'Install: npx expo install @tanstack/react-query',
          ].join('\n'),
        }],
      }
    }
  )

  server.tool(
    'create_query_hook',
    'Create a React Query hook for a resource inside a feature. Generates query keys, list hook, and detail hook.',
    {
      cwd: z.string().describe('Project root directory path'),
      featureName: z.string().describe('Feature name (e.g., "Profile")'),
      resourceName: z.string().describe('Resource name in PascalCase (e.g., "User", "Post")'),
      baseUrl: z.string().optional().describe('Base API URL for mobile (e.g., "https://api.example.com"). Web uses relative /api/ paths.'),
      platform: z.enum(['nextjs', 'expo', 'auto']).default('auto'),
    },
    async ({ cwd, featureName, resourceName, baseUrl, platform: platformArg }) => {
      const info = detectProject(cwd)
      const platform = platformArg === 'auto' ? info.platform : platformArg

      const feature = toPascalCase(featureName)
      const resource = toPascalCase(resourceName)
      const resourceLower = resourceName.charAt(0).toLowerCase() + resourceName.slice(1)

      const hookPath = join(info.featuresPath, feature, 'api', `use${resource}.ts`)

      let content: string
      if (platform === 'expo') {
        content = mobileQueryHookTemplate(resource, resourceLower, baseUrl ?? 'process.env.EXPO_PUBLIC_API_URL')
      } else {
        content = webQueryHookTemplate(resource, resourceLower)
      }

      const result = writeFileSafe(hookPath, content)

      return {
        content: [{
          type: 'text',
          text: [
            `Query hook created: use${resource}List, use${resource}Detail`,
            '',
            'File:',
            formatResults([result]),
            '',
            'Usage:',
            `  import { use${resource}List } from '@/features/${feature}/api/use${resource}'`,
            '',
            `  const { data, isLoading } = use${resource}List()`,
          ].join('\n'),
        }],
      }
    }
  )
}
