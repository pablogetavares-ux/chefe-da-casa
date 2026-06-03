# Custo de receitas por mercado

Calcula o custo total de uma receita em cada mercado cadastrado em `market_prices`, com ranking do mais barato ao mais caro.

## Viabilidade

- Receitas já guardam ingredientes em JSON (`name`, `quantity`, `unit`, `optional`).
- Catálogo `products` + `market_prices` (seed MCP) cobre matching por nome (ex.: `tomate` → Tomate italiano).
- Sem migration extra: matching em código, reutilizando normalização de ofertas.

## Endpoints

| Método   | Rota                                                           | Auth                |
| -------- | -------------------------------------------------------------- | ------------------- |
| GET      | `/api/v1/recipes/cost?recipeId=UUID`                           | sim                 |
| GET      | `/api/v1/recipes/cost?recipeId=UUID&includeSubstitutions=true` | sim (+ sugestões)   |
| POST     | `/api/v1/recipes/cost`                                         | sim                 |
| GET/POST | `/api/recipes/cost`                                            | alias da rota acima |

Com `includeSubstitutions=true`, a resposta inclui `substitutions` e `estimatedSubstitutionSavings` (catálogo `ingredient_substitutions`). Ver [SUBSTITUTIONS.md](./SUBSTITUTIONS.md).

### Resposta (resumo)

```json
{
  "success": true,
  "data": {
    "recipeId": "...",
    "recipeTitle": "Receita saudável de tomate e ovo",
    "servings": 4,
    "costPerServing": 4.87,
    "cheapestMarket": { "marketName": "Atacadão", "totalCost": 19.48, "rank": 1 },
    "marketRankings": [
      {
        "marketName": "Atacadão",
        "rank": 1,
        "totalCost": 19.48,
        "vsCheapest": 0,
        "priceSpread": 0,
        "lineItems": [...]
      }
    ],
    "summary": {
      "cheapestTotal": 19.48,
      "mostExpensiveTotal": 20.48,
      "priceSpread": 1.0,
      "cheapestMarketName": "Atacadão"
    }
  }
}
```

## Código

- Utilitário puro: `src/lib/recipes/calculate-recipe-cost.ts`
- Serviço (Supabase): `src/modules/recipes/services/recipe-cost.ts`
- Testes: `src/lib/recipes/calculate-recipe-cost.test.ts`

## Testar

```bash
npm test -- src/lib/recipes/calculate-recipe-cost.test.ts
```

Com login no navegador (substitua o ID da receita):

```javascript
const r = await fetch("/api/v1/recipes/cost?recipeId=SUA_RECEITA_ID");
console.log(await r.json());
```

POST com ingredientes inline:

```javascript
await fetch("/api/v1/recipes/cost", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    title: "Teste",
    servings: 2,
    ingredients: [
      { name: "tomate", quantity: 1, unit: "kg" },
      { name: "ovo", quantity: 6, unit: "un" },
    ],
  }),
}).then((r) => r.json());
```

## Limitações

- Ingredientes sem produto correspondente no catálogo entram como “faltando” naquele mercado.
- Unidades diferentes (ex.: colher de sopa vs pacote) usam fator estimado (`estimated: true` na linha).
- Cadastre mais `products` / `market_prices` para melhor cobertura.
