# Produtos e Preços

Catálogo de ingredientes/produtos com preços por mercado, para comparação entre lojas.

## Banco (Supabase)

- `products` — `name`, `slug`, `category`, `base_unit`
- `market_prices` — `product_id`, `market_name`, `price`, `updated_at` (único por produto + mercado)

Migration: `supabase/migrations/20260530200000_products_and_market_prices.sql`

RLS: leitura para usuários autenticados; escrita via service role nas rotas admin.

## API (`/api/v1`)

| Método | Rota                    | Auth    | Descrição                           |
| ------ | ----------------------- | ------- | ----------------------------------- |
| GET    | `/products`             | usuário | Lista (`category`, `q`, `limit`)    |
| POST   | `/products`             | admin   | Cria produto                        |
| GET    | `/products/[id]`        | usuário | Detalhe + preços                    |
| PATCH  | `/products/[id]`        | admin   | Atualiza                            |
| DELETE | `/products/[id]`        | admin   | Remove                              |
| GET    | `/products/[id]/prices` | usuário | Preços do produto                   |
| POST   | `/products/[id]/prices` | admin   | Adiciona/atualiza preço por mercado |
| PATCH  | `/market-prices/[id]`   | admin   | Atualiza preço                      |
| DELETE | `/market-prices/[id]`   | admin   | Remove preço                        |
| GET    | `/products/compare`     | premium | Comparação entre mercados           |

## Código

- Módulo: `src/modules/products-prices/`
- Validação Zod: `src/lib/validations/products.ts`
- Tipos: `src/types/database.ts` (`Product`, `MarketPrice`)

## Admin

Escritas exigem `SUPABASE_SERVICE_ROLE_KEY` e e-mail em `ADMIN_EMAILS` (em dev, qualquer usuário autenticado se a lista estiver vazia).

## Como testar

### 1. Automático (recomendado)

Com `yarn dev` rodando e `.env` com Supabase:

```bash
npm run test:products
```

O script valida: 401 sem login, listagem, detalhe, preços por produto, comparação (200 se Premium ou 403 no Free) e, se houver `SUPABASE_SERVICE_ROLE_KEY`, cria/apaga um produto de teste.

Variáveis opcionais:

- `SMOKE_TEST_EMAIL` / `SMOKE_TEST_PASSWORD` — usuário fixo
- `NEXT_PUBLIC_APP_URL` — padrão `http://localhost:3000`

Checagem estática + HTTP (servidor ligado):

```bash
npm run integration:mcp
```

Smoke completo do app (inclui outras APIs):

```bash
npm run test:smoke
```

### 2. Navegador (DevTools)

1. Faça login em http://localhost:3000/login
2. Abra DevTools → **Network**
3. No console da aba logada:

```javascript
const r = await fetch("/api/v1/products?limit=5");
console.log(await r.json());
```

Para comparar preços (precisa plano Pro/Família ou mock em dev):

```javascript
const r = await fetch("/api/v1/products/compare?category=PRODUCE");
console.log(await r.json());
```

### 3. curl (com cookie de sessão)

Exporte o cookie `sb-*` do navegador após login e use:

```bash
curl -s "http://localhost:3000/api/v1/products" -H "Cookie: SEU_COOKIE_AQUI"
curl -s "http://localhost:3000/api/v1/products/ID/prices" -H "Cookie: SEU_COOKIE_AQUI"
```

POST admin (dev: qualquer usuário logado; produção: e-mail em `ADMIN_EMAILS`):

```bash
curl -s -X POST "http://localhost:3000/api/v1/products" \
  -H "Cookie: SEU_COOKIE" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Banana prata\",\"category\":\"PRODUCE\",\"baseUnit\":\"kg\"}"
```

Requer `SUPABASE_SERVICE_ROLE_KEY` no `.env` do servidor.

### 4. Supabase (dados no banco)

No [Dashboard](https://supabase.com/dashboard/project/mnevlegpkrncxlqkqdnl/editor) → Table Editor → `products` / `market_prices`.

Seed atual (5 produtos, preços em mercados BH): Arroz, Azeite, Feijão, Ovos, Tomate.

SQL rápido:

```sql
SELECT p.name, mp.market_name, mp.price
FROM products p
JOIN market_prices mp ON mp.product_id = p.id
ORDER BY p.name, mp.price;
```

## Próximos passos

- UI em `/app/compare` ou painel admin
- Vincular `products.slug` a `ingredients.slug` para listas de compras
- Unificar com `regional_offers` onde fizer sentido
