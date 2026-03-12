# FrontForge

MCP server that scaffolds production-ready frontend projects with Atomic Design.

Works with **Claude Code** and any MCP-compatible AI assistant. Supports **Next.js** and **Expo/React Native**.

## What it does

FrontForge handles the boring structural work so your AI assistant can focus on writing actual code:

- Creates feature directories with Atomic Design layers (atoms, molecules, organisms, templates)
- Generates components with proper barrel exports and index files
- Sets up React Query providers and hooks
- Wires everything into your layout
- Generates a CLAUDE.md with project rules (import conventions, styling, design patterns)
- Auto-detects Next.js vs Expo projects

## Installation

Add to your MCP configuration:

```json
{
  "mcpServers": {
    "frontforge": {
      "command": "npx",
      "args": ["@quardianwolf/frontforge"]
    }
  }
}
```

**Claude Code (user-level):** `~/.claude/settings.json`

**Project-level:** `.mcp.json` in your project root (add `"type": "stdio"`)

## Tools

### `project_info`

Detect project type, folder structure, and current state.

```
project_info(cwd: "/path/to/project")
→ Platform: Next.js | Has src/: true | Has features/: false
```

### `scaffold_project`

Set up the complete project skeleton: features/, providers, query client, theme, and CLAUDE.md.

```
scaffold_project(cwd: "...", projectName: "my-app", platform: "auto")
→ Creates: features/, lib/query-provider.tsx, lib/utils.ts, public/my-app/, CLAUDE.md
```

- Auto-detects platform from project files (next.config, app.json, package.json)
- **Next.js:** QueryProvider, cn() utility, Tailwind setup, security headers reminder
- **Expo:** QueryProvider, theme.ts (colors, spacing, typography), assets directory
- Appends rules to existing CLAUDE.md without overwriting

### `create_feature`

Create a feature directory with full Atomic Design structure.

```
create_feature(cwd: "...", featureName: "Landing")
→ features/Landing/
    components/atoms/index.ts
    components/molecules/index.ts
    components/organisms/index.ts
    components/templates/index.ts
    hooks/ api/ types/
    index.ts (barrel)
```

### `create_component`

Generate a component with its own folder, barrel export, and automatic index wiring.

```
create_component(cwd: "...", featureName: "Landing", componentName: "HeroSection", layer: "organisms")
→ features/Landing/components/organisms/HeroSection/
    HeroSection.tsx
    index.ts
  + updates organisms/index.ts barrel
```

**Expo projects** also get a `styles.ts` file with Expo CSS.

Import path is always shown in output:
```typescript
import { HeroSection } from '@/features/Landing/components/organisms'
```

### `create_style`

Create or update Expo CSS style files for mobile components. (Expo only)

```
create_style(cwd: "...", featureName: "Landing", componentName: "HeroSection", layer: "organisms",
  styles: { container: { flex: 1, padding: 16 }, title: { fontSize: 24 } })
→ features/Landing/components/organisms/HeroSection/styles.ts
```

### `setup_query_provider`

Wire up QueryProvider in the root layout with React Query devtools.

```
setup_query_provider(cwd: "...", platform: "auto")
→ Next.js: lib/query-provider.tsx + lib/utils.ts + app/layout.tsx
→ Expo:    lib/query-provider.tsx + lib/theme.ts  + app/_layout.tsx
```

### `create_query_hook`

Generate React Query hooks for a resource — list and detail queries with typed query keys.

```
create_query_hook(cwd: "...", featureName: "Profile", resourceName: "User")
→ features/Profile/api/useUser.ts
  exports: userKeys, useUserList(), useUserDetail(id)
```

## Generated Structure

### Next.js

```
src/
├── app/
│   ├── layout.tsx          ← QueryProvider wired here
│   └── page.tsx
├── features/
│   └── Landing/
│       ├── components/
│       │   ├── atoms/
│       │   │   ├── Logo/
│       │   │   │   ├── Logo.tsx
│       │   │   │   └── index.ts
│       │   │   └── index.ts      ← export * from './Logo'
│       │   ├── molecules/
│       │   ├── organisms/
│       │   └── templates/
│       ├── hooks/
│       ├── api/             ← React Query hooks
│       ├── types/
│       └── index.ts         ← feature barrel
├── lib/
│   ├── query-provider.tsx
│   └── utils.ts             ← cn() helper
└── public/
    └── my-app/              ← project-named assets
        ├── hero/
        ├── about/
        └── shared/
```

### Expo / React Native

```
├── app/
│   ├── _layout.tsx          ← QueryProvider wired here
│   └── index.tsx
├── features/
│   ├── shared/              ← core atoms, hooks, lib
│   └── Landing/
│       ├── atoms/
│       │   └── Button/
│       │       ├── Button.tsx
│       │       ├── styles.ts    ← Expo CSS
│       │       └── index.ts
│       ├── molecules/
│       ├── organisms/
│       ├── templates/
│       ├── hooks/
│       ├── api/
│       └── index.ts
├── lib/
│   ├── query-provider.tsx
│   └── theme.ts              ← colors, spacing, typography
└── assets/
    ├── fonts/
    └── images/
```

## CLAUDE.md

`scaffold_project` automatically generates (or appends to) a `CLAUDE.md` with rules for:

- **Import conventions** — always `@/features/Feature/components/layer`, never relative
- **Atomic Design layers** — what goes where, layer import rules
- **Styling** — Tailwind + cn() for web, Expo CSS + styles.ts for mobile
- **Tool usage** — instructs AI to use FrontForge tools for scaffolding
- **Design rules** — use /frontend-design skill, stick to existing design system, present options to user
- **Visual QA** — verify output with agent-browser after building

If a CLAUDE.md already exists, FrontForge appends its rules without touching existing content.

## Platform Detection

FrontForge auto-detects the platform by checking (in order):

1. `app.json` with `expo` key → Expo
2. `app.config.js` / `app.config.ts` → Expo
3. `next.config.js` / `next.config.ts` / `next.config.mjs` → Next.js
4. `package.json` dependencies (`expo` or `next`) → respective platform

Pass `platform: "nextjs"` or `platform: "expo"` to override.

## Development

```bash
git clone https://github.com/quardianwolf/frontforge.git
cd frontforge
npm install
npm run build    # compile TypeScript
npm run dev      # watch mode
```

Test locally:
```json
{
  "mcpServers": {
    "frontforge": {
      "command": "node",
      "args": ["/absolute/path/to/frontforge/dist/index.js"]
    }
  }
}
```

## Links

- [npm](https://www.npmjs.com/package/@quardianwolf/frontforge)
- [GitHub](https://github.com/quardianwolf/frontforge)
- [Website](https://frontforge.atilla.dev)

## License

MIT
