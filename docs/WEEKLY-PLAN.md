# Planejamento semanal de refeições

Gera 7 dias de refeições conforme o objetivo do usuário, consolida lista de compras, estima custo semanal e sugere o mercado mais barato (catálogo `products` + `market_prices`).

## Objetivos (`goal`)

| Valor        | Foco                                       |
| ------------ | ------------------------------------------ |
| `economizar` | Pratos brasileiros de baixo custo          |
| `saude`      | Refeições leves, legumes, peixe, integrais |
| `proteina`   | Alto teor proteico para treino/recuperação |

## Endpoints

| Método | Rota                  | Alias              |
| ------ | --------------------- | ------------------ |
| GET    | `/api/v1/weekly-plan` | `/api/weekly-plan` |
| POST   | `/api/v1/weekly-plan` | `/api/weekly-plan` |

Auth obrigatória.

### GET

```
/api/weekly-plan?goal=economizar&startsOn=2026-06-02&excludePantry=true&persist=false
```

### POST

```json
{
  "goal": "proteina",
  "startsOn": "2026-06-02",
  "excludePantry": true,
  "persist": true
}
```

## Resposta (resumo)

```json
{
  "success": true,
  "data": {
    "goal": "economizar",
    "goalLabel": "Economizar",
    "startsOn": "2026-06-02",
    "days": [
      {
        "dayIndex": 1,
        "dayLabel": "Segunda-feira",
        "date": "2026-06-02",
        "meals": [
          { "title": "...", "ingredients": [], "estimatedDayCost": 12.5 }
        ]
      }
    ],
    "shoppingList": {
      "items": [{ "name": "Arroz branco", "quantity": 4, "unit": "xícara" }],
      "totalLines": 18
    },
    "weeklyCost": {
      "totalCheapest": 89.4,
      "costPerDay": 12.77,
      "currency": "BRL"
    },
    "cheapestMarket": {
      "marketName": "Atacadão",
      "totalCost": 89.4
    },
    "marketRankings": [],
    "planId": null
  }
}
```

## Persistência

Com `persist=true`, salva snapshot em `weekly_meal_plans` (Supabase, migration MCP).

## UI

- Rota: `/app/weekly-plan`
- Atalho no menu e na home (ação rápida)
- Gera plano, mostra cardápio, lista consolidada, custo e mercado mais barato
- Botão **Adicionar à lista** envia itens para a lista de compras ativa

## Smoke

```bash
npm run test:weekly-plan
```
