# Painel administrativo

Rota: `/app/admin` (somente e-mails em `ADMIN_EMAILS`).

## Abas

| Aba         | API                            | Conteúdo                        |
| ----------- | ------------------------------ | ------------------------------- |
| Visão geral | `GET /api/v1/admin/stats`      | KPIs, planos, ofertas regionais |
| Usuários    | `GET /api/v1/admin/users`      | Lista paginada + busca          |
| Ofertas     | `GET /api/v1/admin/offers`     | Catálogo regional + lojas       |
| Atividade   | `GET /api/v1/admin/activity`   | `usage_logs` recentes           |
| Sistema     | `GET /api/v1/launch-checklist` | Prontidão e checklist go-live   |

## Requisitos

- `ADMIN_EMAILS` — lista separada por vírgula
- `SUPABASE_SERVICE_ROLE_KEY` — dados reais (sem isso, modo demo parcial)

## Código

- Módulo: `src/modules/admin/`
- UI: `src/components/features/admin/`
- Hooks: `src/shared/hooks/api/admin.ts`
