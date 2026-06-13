# Setup do Ambiente — Chefe da Casa

## Stack configurada

| Ferramenta                             | Versão / Status |
| -------------------------------------- | --------------- |
| Next.js 16 (App Router)                | ✅              |
| TypeScript (strict)                    | ✅              |
| TailwindCSS 4                          | ✅              |
| ESLint + eslint-config-next            | ✅              |
| Prettier + eslint-config-prettier      | ✅              |
| Husky + lint-staged                    | ✅              |
| shadcn/ui (base-nova)                  | ✅              |
| React Query + Devtools                 | ✅              |
| Zustand                                | ✅              |
| Prisma 7 + adapter-pg                  | ✅              |
| Supabase (@supabase/ssr + supabase-js) | ✅              |
| next-themes (dark mode)                | ✅              |

## Aliases TypeScript

```json
"@/*"           → src/*
"@/components/*" → src/components/*
"@/config/*"     → src/config/*
"@/hooks/*"      → src/hooks/*
"@/lib/*"        → src/lib/*
"@/providers/*"  → src/providers/*
"@/stores/*"     → src/stores/*
"@/types/*"      → src/types/*
```

## Scripts

```bash
npm run dev          # Desenvolvimento
npm run build        # Build produção
npm run lint         # ESLint
npm run lint:fix     # ESLint com auto-fix
npm run format       # Prettier write
npm run format:check # Prettier check
npm run typecheck    # TypeScript
npm run validate     # typecheck + lint + format
```

## Git Hooks (Husky)

**pre-commit:** `lint-staged` — ESLint fix + Prettier nos arquivos staged.

## Estrutura

```
src/
├── app/              # Rotas Next.js
├── components/
│   ├── ui/           # shadcn primitives
│   ├── layout/       # Header, sidebar, footer, theme
│   └── features/     # Por domínio (auth, pantry, recipes)
├── config/           # site, theme, env, plans
├── hooks/            # Custom hooks + React Query
├── lib/              # supabase, prisma, api, validations, ai
├── providers/        # Theme, Query, AppProviders
├── stores/           # Zustand
└── types/            # TypeScript global + Supabase
```

## Providers

```tsx
// src/providers/index.tsx
ThemeProvider → QueryProvider → children
```

## Tema

- Tokens em `src/config/theme.ts`
- CSS variables em `src/app/globals.css`
- Paleta: verde saúde (primary) + âmbar culinário (accent)
- Dark mode via `next-themes` + `ThemeToggle`

## Variáveis de ambiente

Copie `.env.example` → `.env` e preencha:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=          # opcional (Prisma)
OPENAI_API_KEY=        # módulo IA
```

Validação tipada em `src/config/env.ts` (servidor).

Deploy em produção: [docs/DEPLOY.md](./DEPLOY.md).
