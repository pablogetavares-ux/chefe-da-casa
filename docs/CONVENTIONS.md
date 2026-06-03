# Convenções de Código

## Nomenclatura

| Elemento    | Convenção         | Exemplo           |
| ----------- | ----------------- | ----------------- |
| Arquivos    | kebab-case        | `recipe-card.tsx` |
| Componentes | PascalCase        | `RecipeCard`      |
| Hooks       | `use` + camelCase | `useRecipes`      |
| Tipos       | PascalCase        | `Recipe`          |
| DB columns  | snake_case        | `created_at`      |

## Componentes

- Server Components por padrão
- `"use client"` apenas para interatividade
- Props com `type`, nunca `any`
- Features em `components/features/<domínio>/` ou `@/modules/<domínio>`

## Server Actions

```typescript
"use server";

export async function action(input: unknown) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { success: false, error: "..." };
  // ...
}
```

## API Routes

- Prefixo `/api/v1/`
- Resposta `ApiResponse<T>`
- Auth check em rotas protegidas

## Git (Conventional Commits)

```
feat: add recipe generation
fix: correct RLS policy
docs: update architecture
```

## Ambiente

- Nunca commitar `.env`
- Secrets sem `NEXT_PUBLIC_`
