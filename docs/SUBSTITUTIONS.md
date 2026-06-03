# Substituições inteligentes de ingredientes

Catálogo em `ingredient_substitutions` (Supabase) com regras de troca e economia estimada via `products` + `market_prices`.

## Tabela

| Coluna                                          | Descrição                                     |
| ----------------------------------------------- | --------------------------------------------- |
| `original_name`                                 | Ingrediente da receita (ex.: peito de frango) |
| `substitute_name`                               | Alternativa sugerida (ex.: frango inteiro)    |
| `reason`                                        | Motivo legível para o usuário                 |
| `original_product_id` / `substitute_product_id` | Vínculo opcional ao catálogo de produtos      |

RLS: leitura para usuários autenticados (`is_active = true`).

## API

| Método | Rota                    | Alias                |
| ------ | ----------------------- | -------------------- |
| GET    | `/api/v1/substitutions` | `/api/substitutions` |
| POST   | `/api/v1/substitutions` | `/api/substitutions` |

### GET

- `?recipeId=<uuid>` — sugere substituições para a receita do usuário
- `?recipeId=<uuid>&applySubstitutions=true` — inclui `recipeCostWithSubstitutions`
- `?catalogOnly=true` — apenas catálogo de regras

### POST

```json
{
  "recipeId": "uuid-opcional",
  "ingredients": [{ "name": "arroz branco", "quantity": 2, "unit": "xicara" }],
  "marketName": "Atacadão",
  "applySubstitutions": true
}
```

Resposta inclui `suggestions`, `estimatedTotalSavings`, `recipeCost` e opcionalmente `recipeCostWithSubstitutions`.

## Integração com custo

Usa o mesmo matching de `calculate-recipe-cost.ts`. Com `applySubstitutions`, os produtos substitutos do catálogo entram no recálculo de `marketRankings`.

## Distinção da IA

`POST /api/v1/ai/substitutions` continua sendo sugestão via LLM no snapshot da receita. Este módulo é **baseado em regras + preços** do banco.

## UI

Na página `/app/recipes/[id]`, o painel **Economizar no mercado** (`RecipeMarketSavingsPanel`) carrega automaticamente `GET /api/v1/substitutions?recipeId=…&applySubstitutions=true`, exibe economia estimada, mercado de referência e link para `/app/compare`. Ferramentas de IA na mesma página usam substituições criativas (sem preços do catálogo).

## Smoke

```bash
npm run test:substitutions
```

Requer `yarn dev` e sessão de teste (mesmo padrão de `test:products`).
