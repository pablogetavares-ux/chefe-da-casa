# Integração Frontend ↔ Backend (MCP)

> Projeto `chefe-da-casa` · Supabase `mnevlegpkrncxlqkqdnl`

## Status geral: ✅ Operacional

| Camada            | Status |
| ----------------- | ------ |
| Next.js build     | ✅     |
| TypeScript strict | ✅     |
| Supabase Auth     | ✅     |
| Supabase DB + RLS | ✅     |
| API v1            | ✅     |
| React Query → API | ✅     |
| MCP sync tipos    | ✅     |

## Fluxo de integração

```
Browser (React Query)
    ↓ fetch /api/v1/*  (credentials: same-origin, timeout 30s)
Next.js Route Handler
    ↓ requireAuthUser() / Bearer via Authorization header
    ↓ createClient(request) — cookie ou Bearer
Supabase Postgres + RLS
    ↑ validado via MCP (list_tables, execute_sql, advisors)
```

**Regra:** o browser **nunca** escreve direto em tabelas de usuário — só via API routes.

## Workflow MCP (agente ou dev)

### 1. DDL / dados

```text
MCP apply_migration  →  supabase/migrations/*.sql (espelhar no repo)
MCP execute_sql        →  seeds / fixes pontuais
MCP get_advisors       →  security + performance
```

### 2. Tipos TypeScript

```text
MCP generate_typescript_types
    → salvar em scripts/mcp-types.json  { "types": "..." }
    → npm run db:types:mcp
    → src/types/database.ts
```

Alternativa CLI: `npm run db:types`

### 3. Verificação integrada

```bash
npm run integration:mcp   # tipos + rotas + health + 401
npm run test:smoke        # fluxo autenticado completo
npm run typecheck
```

### 4. Imagens de ofertas (Storage)

```bash
npm run offers:sync-images
```

## Mapa frontend → API → Supabase

| UI / Hook                     | API                                   | Tabela(s)                                               |
| ----------------------------- | ------------------------------------- | ------------------------------------------------------- |
| `useProfile`                  | `GET/PATCH /api/v1/profile`           | `profiles`                                              |
| `usePantryItems`              | `/api/v1/pantry`                      | `pantry_items`                                          |
| `useRecipes`                  | `/api/v1/recipes`                     | `recipes`                                               |
| `useFavorites`                | `/api/v1/favorites`                   | `favorites`                                             |
| `useShoppingList`             | `/api/v1/shopping-list/*`             | `shopping_lists`, `shopping_list_items`                 |
| `useOffers`                   | `/api/v1/offers`                      | `regional_offers`, `regional_stores`, `offer_favorites` |
| `useOffersHub`                | `/api/v1/offers/hub`                  | `offer_verticals`, `regional_offers`                    |
| `useOffersForRecipe`          | `/api/v1/offers/for-recipe`           | idem + matching em `modules/offers`                     |
| `useOffersForPantry`          | `/api/v1/offers/for-pantry`           | `pantry_items`, `recipes`, ofertas                      |
| `useOffersForAntiWaste`       | `/api/v1/offers/for-anti-waste`       | anti-waste summary + ofertas                            |
| `useOffersForIngredients`     | `POST /api/v1/offers/for-ingredients` | matching por ingredientes                               |
| `useOffersIntegrationContext` | `/api/v1/offers/context`              | `profiles`, `offer_extension_registry`                  |
| `useOfferRegionConfig`        | `/api/v1/offers/region`               | `profiles` (região)                                     |
| `useAddOfferToShoppingList`   | `POST /api/v1/offers/add-to-shopping` | bridge → `shopping_list_items`                          |
| `useAiUsage`                  | `/api/v1/ai/usage`                    | `usage_logs`, `profiles.plan`                           |
| Login / OAuth                 | Server Actions                        | `auth.users` → trigger → `profiles`                     |

## Endpoints (amostra)

| Rota                                  | Auth |
| ------------------------------------- | ---- |
| `GET /api/health`                     | Não  |
| `GET /api/v1/profile`                 | Sim  |
| `GET/POST /api/v1/pantry`             | Sim  |
| `GET /api/v1/recipes`                 | Sim  |
| `GET /api/v1/offers`                  | Sim  |
| `GET /api/v1/offers/for-recipe`       | Sim  |
| `POST /api/v1/offers/add-to-shopping` | Sim  |

Lista completa: [AUDIT.md](./AUDIT.md)

## Migrações recentes (offers + audit)

| Migration                     | Conteúdo                          |
| ----------------------------- | --------------------------------- |
| `regional_offers_module`      | Tabelas + RLS                     |
| `offer_images_storage_bucket` | Bucket público (sem listagem)     |
| `audit_integration_fixes`     | Índice `offer_favorites`, storage |

## Variáveis obrigatórias

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # scripts / admin only
```

## Auth go-live

Checklist 5 itens (Free vs Pro): [GO-LIVE-AUTH.md](./GO-LIVE-AUTH.md)

## Ver também

- [AUTH.md](./AUTH.md) — fluxos de autenticação
- [MODULES.md](./MODULES.md) — domínios do código
- [AUDIT.md](./AUDIT.md) — auditoria completa
