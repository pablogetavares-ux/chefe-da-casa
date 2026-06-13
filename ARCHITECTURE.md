# Chefe da Casa — Arquitetura

> Documento de referência arquitetural. Versão base — Maio/2026.

## 1. Visão Geral

**Chefe da Casa** é um SaaS culinário que usa IA para gerar receitas saudáveis a partir dos ingredientes disponíveis na despensa do usuário.

### Princípios arquiteturais

| Princípio                | Decisão                                                                      |
| ------------------------ | ---------------------------------------------------------------------------- |
| **Monolito modular**     | Next.js App Router como única aplicação; módulos isolados por domínio        |
| **Server-first**         | Lógica sensível e IA no servidor; Client Components apenas quando necessário |
| **Type-safe end-to-end** | TypeScript + Zod + Prisma + tipos Supabase                                   |
| **Defense in depth**     | RLS no Postgres + validação no servidor + middleware de auth                 |
| **Incremental delivery** | Features entregues por módulos independentes (ver ROADMAP)                   |

---

## 2. Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTE (Browser)                        │
│  React 19 · TailwindCSS · shadcn/ui · Framer Motion · Zustand   │
│  React Query (cache/fetch) · Supabase Auth (sessão via cookies) │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
┌────────────────────────────▼────────────────────────────────────┐
│                    NEXT.JS 16 (App Router)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Route Groups │  │ Server       │  │ API Routes /v1       │  │
│  │ (marketing)  │  │ Components   │  │ Server Actions       │  │
│  │ (auth)       │  │              │  │ Route Handlers       │  │
│  │ /app         │  │              │  │                      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│  Middleware (auth refresh · route protection)                    │
└───────┬─────────────────┬──────────────────────┬────────────────┘
        │                 │                      │
        ▼                 ▼                      ▼
┌───────────────┐  ┌──────────────┐      ┌──────────────┐
│ Supabase Auth │  │ Supabase     │      │ OpenAI API   │
│ (OAuth, JWT)  │  │ PostgreSQL   │      │ (GPT-4o)     │
└───────────────┘  │ + RLS        │      └──────────────┘
                   │ + Storage    │
                   └──────┬───────┘
                          │
                   ┌──────▼───────┐
                   │ Prisma ORM   │
                   │ (server-side)│
                   └──────────────┘
```

---

## 3. Estrutura de Pastas

```
chefe-da-casa/
├── docs/
│   ├── ROADMAP.md
│   └── CONVENTIONS.md
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── (marketing)/
│   │   ├── (auth)/
│   │   ├── app/
│   │   ├── auth/callback/
│   │   └── api/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── features/
│   │   └── shared/
│   ├── config/
│   ├── hooks/
│   ├── lib/
│   ├── providers/
│   ├── stores/
│   ├── types/
│   └── middleware.ts
├── ARCHITECTURE.md
└── package.json
```

Consulte [docs/CONVENTIONS.md](./docs/CONVENTIONS.md) para padrões de código detalhados.

---

## 4. Organização Frontend / Backend

### Frontend (Client)

- Route Groups separam áreas públicas, auth e app autenticado
- Server Components por padrão; `"use client"` apenas para interatividade
- React Query para dados do cliente
- Zustand para estado UI local
- Framer Motion para animações

### Backend (Server)

| Camada         | Responsabilidade                                 |
| -------------- | ------------------------------------------------ |
| Route Handlers | REST endpoints versionados                       |
| Server Actions | Mutations com validação Zod                      |
| Prisma         | Queries type-safe (somente servidor)             |
| Supabase SSR   | Auth session refresh via cookies                 |
| OpenAI         | Geração de receitas — exclusivamente server-side |

---

## 5. Autenticação

**Provedor:** Supabase Auth

- Email/senha + OAuth (Google)
- Sessão via cookies HTTP-only (`@supabase/ssr`)
- Middleware renova token a cada request
- Perfil em `profiles` sincronizado via trigger
- Planos em `app_metadata` (nunca `user_metadata`)

---

## 6. Integração IA

**Provedor:** OpenAI (`gpt-4o-mini` default)

Pipeline: validação Zod → prompt estruturado → OpenAI JSON mode → validação output → persistência → UsageLog.

---

## 7. SaaS

Planos Free / Pro / Family com limites em `src/config/plans.ts`. Billing via Stripe na Fase 3.

---

## 8–11. Responsividade, Segurança, Performance, SEO

- **Responsivo:** mobile-first, breakpoints Tailwind, sidebar colapsável
- **Segurança:** RLS, Zod, rate limiting, secrets server-side
- **Performance:** RSC, React Query cache, `next/image`, índices DB
- **SEO:** metadata, sitemap, robots, noindex em `/app` e auth

---

## Próximos Passos

Consulte [docs/ROADMAP.md](./docs/ROADMAP.md).
