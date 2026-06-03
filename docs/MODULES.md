# Arquitetura modular — Chef da Casa AI

> Next.js 16 (web SaaS). **Não** é React Native — mobile nativo seria projeto separado ou Expo Router com código compartilhado em `packages/`.

## Estrutura

```
src/
├── app/                    # Rotas finas (App Router) — só composição
├── modules/                # Domínios de negócio (feature modules)
│   ├── ai/
│   ├── recipes/
│   ├── shopping/
│   ├── favorites/
│   ├── nutrition/          # despensa, anti-waste, fitness, idoso
│   ├── chat/
│   ├── community/
│   ├── offers/             # promoções regionais (ativo)
│   └── stores/             # reservado (futuro — dados em regional_stores)
├── shared/                 # Cross-cutting (sem regra de negócio)
│   ├── components/         # AsyncPanel, etc.
│   └── hooks/api/          # React Query por domínio
├── components/             # UI legado (migração gradual → modules)
├── lib/                    # Infra (supabase, api client, billing)
└── config/
```

## Regras

1. **`app/`** importa de `@/modules/*`, nunca lógica de negócio inline.
2. **`modules/*`** exporta via `index.ts` — API pública do domínio.
3. **`shared/`** não importa de `modules/` (evita acoplamento circular).
4. **`lib/`** é infraestrutura compartilhada; migração gradual para `modules/*/services`.
5. Imports legados `@/components/features/*` continuam válidos durante a migração.

## Módulos

| Módulo      | Escopo                                       | Status                          |
| ----------- | -------------------------------------------- | ------------------------------- |
| `recipes`   | Gerar, listar, adaptar, scanner, histórico   | ✅                              |
| `shopping`  | Lista de compras                             | ✅                              |
| `favorites` | Receitas favoritas                           | ✅                              |
| `nutrition` | Despensa, anti-waste, macros, fitness, idoso | ✅                              |
| `ai`        | Pipeline IA, route handlers compartilhados   | ✅                              |
| `chat`      | Chat culinário                               | ✅                              |
| `community` | Social                                       | ⏳ placeholder                  |
| `offers`    | Promoções supermercado                       | ✅                              |
| `stores`    | Lojas próximas                               | 📋 (dados em `regional_stores`) |

## Hooks (React Query)

Divididos em `src/shared/hooks/api/`:

- `identity.ts` — perfil, billing, admin
- `recipes.ts` — receitas, favoritos
- `nutrition.ts` — despensa, anti-waste
- `shopping.ts` — lista de compras
- `ai.ts` — geração, adapt, chat, scan
- `offers.ts` — ofertas regionais, favoritos, bridge shopping

Import: `@/shared/hooks/api` ou `@/hooks` (barrel).

## API routes AI

Rotas duplicadas consolidadas em `modules/ai/services/recipe-mutation-route.ts`:

- `handleAiRecipeFullUpdate` — adapt, refine
- `handleAiRecipeMetadataUpdate` — macros, substitutions

## Migração gradual

Fase atual: **facade + shared hooks + route factory**.

Próximos passos (sem breaking changes):

1. Mover componentes de `components/features/X` → `modules/X/components`
2. Mover `lib/ai/services/*` → `modules/ai/services/*`
3. Páginas `app/app/*` importarem só de `@/modules/*`

## Viabilidade vs. prompt original

| Requisito prompt          | Decisão                                          |
| ------------------------- | ------------------------------------------------ |
| React Native Expo         | ❌ Não aplicável — stack é Next.js web           |
| `/features` na raiz       | ✅ Adaptado para `src/modules/` (padrão Next.js) |
| offers / stores           | ✅ Ofertas ativas; lojas em `regional_stores`    |
| Preservar funcionalidades | ✅ Re-exports mantêm compatibilidade             |
