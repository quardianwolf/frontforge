export function mobileComponentTemplate(name: string): string {
  return `import { View } from 'react-native'
import { styles } from './styles'

interface ${name}Props {
  children?: React.ReactNode
}

export function ${name}({ children }: ${name}Props) {
  return (
    <View style={styles.container}>
      {children}
    </View>
  )
}
`
}

export function mobileStyleTemplate(): string {
  return `import { css } from 'react-native-css'

export const styles = css.create({
  container: {
    flex: 1,
  },
})
`
}

export function mobileBarrelTemplate(componentName: string): string {
  return `export * from './${componentName}'
`
}

export function mobileQueryProviderTemplate(): string {
  return `import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
`
}

export function mobileRootLayoutTemplate(): string {
  return `import { Stack } from 'expo-router'
import { QueryProvider } from '@/lib/query-provider'

export default function RootLayout() {
  return (
    <QueryProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryProvider>
  )
}
`
}

export function mobileThemeTemplate(): string {
  return `export const colors = {
  primary: '#171717',
  secondary: '#737373',
  background: '#ffffff',
  accent: '#6100FF',
  error: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const

export const typography = {
  heading: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
} as const

export type ColorToken = keyof typeof colors
export type SpacingToken = keyof typeof spacing
export type TypographyToken = keyof typeof typography
`
}

export function mobileQueryHookTemplate(resourceName: string, resourceNameLower: string, baseUrl: string): string {
  return `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const BASE_URL = '${baseUrl}'

export const ${resourceNameLower}Keys = {
  all: ['${resourceNameLower}'] as const,
  lists: () => [...${resourceNameLower}Keys.all, 'list'] as const,
  detail: (id: string) => [...${resourceNameLower}Keys.all, 'detail', id] as const,
}

export function use${resourceName}List() {
  return useQuery({
    queryKey: ${resourceNameLower}Keys.lists(),
    queryFn: async () => {
      const res = await fetch(\`\${BASE_URL}/${resourceNameLower}\`)
      if (!res.ok) throw new Error('Failed to fetch ${resourceNameLower}')
      return res.json()
    },
  })
}

export function use${resourceName}Detail(id: string) {
  return useQuery({
    queryKey: ${resourceNameLower}Keys.detail(id),
    queryFn: async () => {
      const res = await fetch(\`\${BASE_URL}/${resourceNameLower}/\${id}\`)
      if (!res.ok) throw new Error('Failed to fetch ${resourceNameLower}')
      return res.json()
    },
    enabled: !!id,
  })
}
`
}
