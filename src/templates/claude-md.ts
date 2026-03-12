export function claudeMdTemplate(platform: 'nextjs' | 'expo', projectName: string): string {
  const common = `
---

## FrontForge MCP (MUST USE)

This project uses the **frontforge** MCP server. You MUST use its tools for structural operations:

- **scaffold_project** — Project setup (features/, providers, theme, CLAUDE.md)
- **create_feature** — New feature with Atomic Design structure
- **create_component** — New component with barrel exports (+ styles.ts on mobile)
- **create_style** — Expo CSS style file (mobile only)
- **setup_query_provider** — QueryProvider + root layout wiring
- **create_query_hook** — React Query hook for a resource
- **project_info** — Detect project type and current state

Do NOT manually create feature folders, component folders, or barrel exports. Always use the tools above — they ensure correct structure, naming, and barrel wiring.

You CAN freely edit the generated files to fill in component content, add props, write hooks, etc. The tools handle scaffolding, you handle the code inside.

## File Paths (CRITICAL)

When writing or editing files, ALWAYS use **absolute paths**. NEVER use relative paths like \`features/Landing/...\`.

\`\`\`
CORRECT:  /Users/username/project/features/Landing/components/atoms/Logo/Logo.tsx
WRONG:    features/Landing/components/atoms/Logo/Logo.tsx
\`\`\`

Use the Read tool first to confirm file locations before writing. The frontforge tools output absolute paths in their results — use those paths directly.

## Import Rules (CRITICAL)

NEVER use relative imports like \`../../atoms/Component\` or \`../molecules/Component\`.
ALWAYS use the \`@/\` path alias with barrel exports:

\`\`\`typescript
// CORRECT
import { Logo, NavLink, Badge } from '@/features/Landing/components/atoms'
import { Navbar, FeatureCard } from '@/features/Landing/components/molecules'
import { HeroSection } from '@/features/Landing/components/organisms'
import { LandingTemplate } from '@/features/Landing/components/templates'

// WRONG - NEVER DO THIS
import { Logo } from '../../atoms/Logo'
import { Logo } from '../atoms/Logo/Logo'
import { Logo } from './Logo'
\`\`\`

Each layer has a barrel \`index.ts\` that re-exports all components. Always import from the layer barrel, not from individual component folders.

## Architecture: Atomic Design + Feature-Based

\`\`\`
features/
└── [FeatureName]/
    ├── components/
    │   ├── atoms/          # Smallest UI pieces (Button, Icon, Badge)
    │   │   └── index.ts    # Barrel: export * from './Component'
    │   ├── molecules/      # Atom combinations (Card, FormField)
    │   │   └── index.ts
    │   ├── organisms/      # Full sections (HeroSection, Footer)
    │   │   └── index.ts
    │   └── templates/      # Layout wrappers
    │       └── index.ts
    ├── hooks/
    ├── api/                # React Query hooks
    ├── types/
    └── index.ts            # Feature barrel
\`\`\`

### Layer Rules
- atoms can only import from: global ui, lib
- molecules can import from: atoms + global
- organisms can import from: atoms + molecules + global
- templates can import from: atoms + molecules + organisms + global
- Lower layers NEVER import from upper layers

## Component Structure

Each component lives in its own folder:
\`\`\`
ComponentName/
├── ComponentName.tsx
${platform === 'expo' ? '├── styles.ts            # Expo CSS styles\n' : ''}└── index.ts
\`\`\`

## TypeScript

- Always use TypeScript (.tsx / .ts), never .jsx / .js
- strict mode enabled
- No \`any\` type - use \`unknown\` + type guards
- Explicit return types on exported functions
- Prefer \`interface\` over \`type\` for objects

## Data Fetching

- Use React Query (@tanstack/react-query) for all server state
- Query hooks live in \`features/[Feature]/api/\`
- QueryProvider is in \`${platform === 'nextjs' ? 'src/' : ''}lib/query-provider.tsx\`
`

  const nextjsSpecific = `
## Styling (Tailwind CSS)

- Use Tailwind CSS classes, no inline styles
- Use \`cn()\` helper from \`@/lib/utils\` for conditional classes
- Design tokens in \`globals.css\` @theme block
- Mobile-first responsive: sm:, md:, lg:

## Assets

- All assets go to \`public/${projectName}/[section]/\`
- Use kebab-case for file names
- Use Next.js \`<Image>\` component for images
- Use \`next/font\` for fonts
- Use \`<Link>\` from \`next/link\` for ALL internal navigation — NEVER use raw \`<a>\` tags for internal links
- Use Next.js native components whenever available (Image, Link, Script, Head)
`

  const expoSpecific = `
## Styling (Expo CSS)

- Each component has its own \`styles.ts\` file
- Use \`css.create()\` from \`react-native-css\`
- Design tokens in \`lib/theme.ts\` (colors, spacing, typography)
- Import tokens in styles: \`import { colors, spacing } from '@/lib/theme'\`
- NO NativeWind, NO inline styles

## Assets

- Fonts in \`assets/fonts/\`
- Images in \`assets/images/\`
- Use \`expo-image\` for optimized image rendering
- Use \`expo-font\` for custom fonts
`

  const designRules = `
## UI Design Rules (CRITICAL)

### Use /frontend-design Skill
When filling in component content (writing actual JSX/TSX), ALWAYS use the \`/frontend-design\` skill to generate production-grade, visually polished UI. Do NOT write generic placeholder UI.

### Design Fidelity
- **DEFAULT behavior**: Always stick to the existing project design system (colors, fonts, spacing, tokens defined in globals.css or theme.ts). Do NOT invent new colors or styles that conflict with the existing design.
- **ONLY when the user explicitly says** something like "make it creative", "surprise me", "make it unique", or "come up with something different" — then you may freely design from scratch.
- If no design system exists yet, ask the user for design preferences before inventing one.

### User Choices (CRITICAL)
When there are multiple valid approaches, ALWAYS present numbered options and let the user choose. NEVER silently pick one. Examples:

\`\`\`
This component could be implemented in several ways:

1. **Minimal** — Clean, lots of whitespace, subtle hover effects
2. **Bold** — Large typography, strong colors, animated gradients
3. **Glassmorphism** — Frosted glass cards, backdrop blur, transparency

Which style would you prefer? (1/2/3)
\`\`\`

Present options for:
- Visual style when not defined by existing design system
- Layout alternatives (grid vs list, sidebar vs top nav)
- Animation/interaction choices (subtle vs expressive)
- Color scheme when starting fresh
- Component behavior when requirements are ambiguous

Do NOT ask for choices on things that are already defined by the project's design system or explicitly stated in the prompt.

### Visual QA with Agent Browser (CRITICAL)

After completing all components and wiring them to a page, you MUST verify the result visually using agent-browser:

\`\`\`bash
agent-browser open http://localhost:3000          # Open the page
agent-browser screenshot --full /tmp/result.png   # Full page screenshot
\`\`\`

Review the screenshot yourself. Check for:
- Layout issues (overlapping, misaligned, broken grid)
- Missing sections or blank areas
- Text readability (contrast, size)
- Responsive issues at default viewport

If you spot problems, fix them immediately and re-screenshot. Do NOT consider the task done until you have visually verified the output looks correct.
`

  return common + (platform === 'nextjs' ? nextjsSpecific : expoSpecific) + designRules
}
