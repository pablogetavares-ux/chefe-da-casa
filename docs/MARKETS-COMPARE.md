# Comparador de mercados (lista de compras)

Compara o custo total da lista de compras em cada mercado usando `products` + `market_prices` (Supabase).

## Viabilidade (MCP)

- **Sem migration** — tabelas `shopping_list_items`, `products`, `market_prices` já existem.
- Matching item → produto por nome (mesma lógica do custo de receita).
- Complementa o comparador de **ofertas regionais** (`/api/v1/pricing/compare`).

## Endpoints

| Método   | Rota                                  | Descrição                    |
| -------- | ------------------------------------- | ---------------------------- |
| GET      | `/api/v1/markets/compare?listId=UUID` | Lista ativa ou informada     |
| POST     | `/api/v1/markets/compare`             | `listId` e/ou `items` inline |
| GET/POST | `/api/markets/compare`                | Alias                        |

**Premium** (Pro/Família), como o comparador de preços.

### POST body

```json
{
  "listId": "uuid-opcional",
  "items": [{ "name": "Tomate", "quantity": 1, "unit": "kg" }]
}
```

## Resposta

- `bestMarket` — mercado mais barato (`isBest: true`)
- `rankings` — do mais barato ao mais caro (`totalCost`, `vsCheapest`, cobertura)
- `comparisonTable` — linhas por item, colunas por mercado
- `summary` — `savingsVsMostExpensive`, `savingsVsAverage`, `priceSpread`

## UI

`/app/compare` → seção **Mercados do catálogo** (tabela + ranking).

## Código

- `src/lib/markets/compare-shopping-list.ts`
- `src/modules/markets/services/compare.ts`

## Teste

```bash
npm test -- src/lib/markets/compare-shopping-list.test.ts
```
