# Ofertas regionais — arquitetura escalável

Módulo evoluído sem recriar `regional_offers` / `regional_stores`. Compatível com favoritos, lista de compras, receitas e home.

## Auditoria (jun/2026)

| Item                                                                 | Status                                 |
| -------------------------------------------------------------------- | -------------------------------------- |
| Migration geo no Supabase (`mnevlegpkrncxlqkqdnl`)                   | ✅ MCP `regional_offers_geo_expansion` |
| Typecheck / build                                                    | ✅                                     |
| Catálogo de lojas: 1 query por request (`fetchOfferStoreCatalog`)    | ✅                                     |
| Detecção de schema com cache + dedupe inflight                       | ✅                                     |
| Componente único de cidade (`OffersRegionCitySelect`)                | ✅                                     |
| Receitas: `state` + `radiusKm` na API; match local sem `regionScope` | ✅                                     |
| UX mobile: selects `min-h-11`; escopo só em localStorage             | ✅ documentado                         |
| `/app/offers`: sem GET duplicado em `/offers/region`                 | ✅ `syncServerConfig: false`           |

## Camadas

| Camada                                  | Responsabilidade                                            |
| --------------------------------------- | ----------------------------------------------------------- |
| `src/modules/offers/region/`            | Geo (Haversine), catálogo de cidades BR, filtros por escopo |
| `src/modules/offers/services/offers.ts` | Query de ofertas + integração receita                       |
| `src/modules/offers/services/region.ts` | Região do usuário (perfil) e mercados ativos                |
| `offer_market_catalog`                  | Parceiros / expansão nacional (somente leitura no app)      |

## Região do usuário

Campos em `profiles`:

- `offer_city`, `offer_state` (UF)
- `offer_search_radius_km` — 10, 25, 50, 100 ou **300** (padrão: 300, hub BH / leste de MG)

API:

- `GET/PUT /api/v1/offers/region`
- Cliente: `api.offers.getRegion()` / `updateRegion()`

Local: `localStorage` chave `chef-offers-region-v1` (migra `chef-offers-city`).

## Mercados (`regional_stores`)

- `name`, `city`, `state`, `latitude`, `longitude`, `is_active`
- `GET /api/v1/offers/stores` — catálogo ativo

## Filtros de ofertas

Query `GET /api/v1/offers`:

| Parâmetro                   | Descrição                                                                |
| --------------------------- | ------------------------------------------------------------------------ |
| `city`, `state`, `radiusKm` | Centro da região                                                         |
| `scope`                     | `same_city` \| `nearby` \| `within_radius` \| `national` (todo o Brasil) |

Comportamento legado: só `city` (sem raio/estado) → filtro exato por nome de cidade, como antes.

## Receitas

`GET /api/v1/offers/for-recipe?recipeId=&scope=` usa a mesma região. Escopos `local` / `cross_city` / `none` preservados.

## Migration

Arquivos: `20260530260000_regional_offers_geo_expansion.sql`, `20260603120000_regional_offers_bh_national_expansion.sql` (raio 300 km, leste de MG, escopo nacional)

### Opção A — SQL Editor (mais rápido)

1. Abra [SQL Editor](https://supabase.com/dashboard/project/mnevlegpkrncxlqkqdnl/sql/new).
2. Cole o conteúdo completo do arquivo de migration e execute.
3. Confira em Database → Tables: colunas em `profiles` e `regional_stores`, tabela `offer_market_catalog`.

### Opção B — Daqui no terminal (recomendado)

1. `npm run setup:database-url` — abre o dashboard; copie a URI **Direct** (5432).
2. O script grava `DIRECT_URL` e aplica a migration automaticamente.

Ou, com token pessoal (`sbp_...`):

1. `npm run setup:access-token`
2. `npm run db:fix:offers-region`

### Opção C — MCP Supabase (Cursor)

Com o plugin Supabase ativo: `apply_migration` com o SQL acima → `npm run db:types` ou `npm run db:types:mcp`.

### Depois de aplicar

```bash
npm run db:types
```

Os tipos em `src/types/database.ts` já incluem as colunas regionais; re-sincronizar só é necessário se o schema remoto divergir.
