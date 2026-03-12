export function webComponentTemplate(name: string, layer: string): string {
  const isClient = layer !== 'templates'
  const clientDirective = isClient ? "'use client'\n\n" : ''

  return `${clientDirective}interface ${name}Props {
  children?: React.ReactNode
}

export function ${name}({ children }: ${name}Props) {
  return (
    <div>
      {children}
    </div>
  )
}
`
}

export function webBarrelTemplate(componentName: string): string {
  return `export * from './${componentName}'
`
}

export function webQueryProviderTemplate(): string {
  return `'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
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
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
`
}

export function webLayoutWithProviderTemplate(): string {
  return `import { QueryProvider } from '@/lib/query-provider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}
`
}

export function webCnUtilTemplate(): string {
  return `import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`
}

export function webQueryHookTemplate(resourceName: string, resourceNameLower: string): string {
  return `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export const ${resourceNameLower}Keys = {
  all: ['${resourceNameLower}'] as const,
  lists: () => [...${resourceNameLower}Keys.all, 'list'] as const,
  detail: (id: string) => [...${resourceNameLower}Keys.all, 'detail', id] as const,
}

export function use${resourceName}List() {
  return useQuery({
    queryKey: ${resourceNameLower}Keys.lists(),
    queryFn: async () => {
      const res = await fetch('/api/${resourceNameLower}')
      if (!res.ok) throw new Error('Failed to fetch ${resourceNameLower}')
      return res.json()
    },
  })
}

export function use${resourceName}Detail(id: string) {
  return useQuery({
    queryKey: ${resourceNameLower}Keys.detail(id),
    queryFn: async () => {
      const res = await fetch(\`/api/${resourceNameLower}/\${id}\`)
      if (!res.ok) throw new Error('Failed to fetch ${resourceNameLower}')
      return res.json()
    },
    enabled: !!id,
  })
}
`
}
