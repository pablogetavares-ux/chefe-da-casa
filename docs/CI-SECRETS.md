# GitHub Actions — secrets para E2E completo

O job `e2e-full` roda cadastro + IA + favoritos quando estes secrets existem:

| Secret                          | Onde obter                               |
| ------------------------------- | ---------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase → Settings → API                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API (anon)         |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase → Settings → API (service_role) |

**Settings → Secrets and variables → Actions → New repository secret**

Sem secrets, o CI executa apenas `e2e-public` (landing, pricing, health).
