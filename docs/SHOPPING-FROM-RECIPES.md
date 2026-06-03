# Lista de compras a partir de receitas

Gera lista consolidada de ingredientes de uma ou mais receitas, com agrupamento, soma de quantidades e ordenação por corredor do mercado.

## Viabilidade (MCP Supabase)

Sem migration nova. Tabelas usadas:

- `recipes.ingredients` (JSONB)
- `shopping_lists` / `shopping_list_items` (`category`, `quantity`, `unit`, `recipe_id`)

## Endpoints

| Método | Rota                    | Descrição                           |
| ------ | ----------------------- | ----------------------------------- |
| GET    | `/api/v1/shopping-list` | Lista inteligente (existente)       |
| POST   | `/api/v1/shopping-list` | Gera/consolida a partir de receitas |
| POST   | `/api/shopping-list`    | Alias                               |

### Body (POST)

```json
{
  "recipeIds": ["uuid-1", "uuid-2"],
  "listId": "opcional",
  "excludePantry": true,
  "persist": true
}
```

- `persist: false` — só retorna preview consolidado, sem gravar
- `excludePantry: true` — ignora o que já está na despensa

### Resposta

- `items` — linhas consolidadas
- `groupedByCategory` — hortifruti, carnes, laticínios, etc.
- `recipes` — receitas processadas
- `added` / `updated` / `skipped` — ao persistir na lista
- `persistedItems` — registros criados/atualizados no banco

## Código

- `src/lib/shopping/consolidate-ingredients.ts` — utilitário puro
- `src/lib/shopping/units.ts` — normalização kg/g, L/ml, un/dz
- `src/modules/shopping/services/from-recipes.ts` — serviço + persistência

## Teste

```bash
npm test -- src/lib/shopping/consolidate-ingredients.test.ts
```

No console (logado):

```javascript
await fetch("/api/v1/shopping-list", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    recipeIds: ["ID_RECEITA_1", "ID_RECEITA_2"],
    persist: false,
  }),
}).then((r) => r.json());
```

Hook React: `useGenerateShoppingListFromRecipes(listId)`.
