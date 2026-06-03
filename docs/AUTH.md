# Autenticação — Chef da Casa AI

Supabase Auth + Next.js App Router (`@supabase/ssr`).

## Fluxos

| Fluxo              | Rota UI               | Backend                                                                |
| ------------------ | --------------------- | ---------------------------------------------------------------------- |
| Login e-mail/senha | `/login`              | Server Action → `supabase.auth.signInWithPassword`                     |
| Cadastro           | `/signup`             | Server Action → `signUp` + trigger `on_auth_user_created` → `profiles` |
| Google OAuth       | botão em login/signup | `signInWithOAuth` → `/auth/callback`                                   |
| Esqueci senha      | `/forgot-password`    | `resetPasswordForEmail`                                                |
| Redefinir senha    | `/reset-password`     | `updateUser`                                                           |
| Logout             | sidebar / form        | Server Action → `signOut`                                              |
| Sessão             | middleware            | `updateSession` + `auth.getUser()`                                     |

## Proteção de rotas

- **Middleware** (`src/middleware.ts`): refresh de cookies, redirect `/app/*` → `/login` se sem sessão.
- **API routes**: `requireAuthUser()` em `src/lib/api/auth.ts` — retorna 401 via `apiError`.
- **Client**: `fetchApi` redireciona para `/login?next=…` em 401.

## RLS (Row Level Security)

Todas as tabelas de usuário usam `(select auth.uid()) = user_id` (ou equivalente).  
Dados compartilhados (ex.: `regional_offers`, `regional_stores`) são **SELECT** para `authenticated` com filtros de negócio (`is_active`, `valid_until`).

Service role (`SUPABASE_SERVICE_ROLE_KEY`) **somente server-side** — nunca expor no client.

## Configuração Supabase (Dashboard)

Projeto: `mnevlegpkrncxlqkqdnl`

### URL Configuration

[Auth → URL Configuration](https://supabase.com/dashboard/project/mnevlegpkrncxlqkqdnl/auth/url-configuration)

- **Site URL:** domínio de produção (ex.: `https://chefdacasa.com.br`)
- **Redirect URLs:** `https://seu-dominio.com/auth/callback`, previews `https://*.vercel.app/auth/callback`

### Provedores

[Auth → Providers](https://supabase.com/dashboard/project/mnevlegpkrncxlqkqdnl/auth/providers)

- E-mail habilitado
- Google OAuth (Client ID/Secret do Google Cloud Console)

### Leaked Password Protection (Plano Pro)

[Auth → Providers → Email](https://supabase.com/dashboard/project/mnevlegpkrncxlqkqdnl/auth/providers?provider=Email)  
Ou status em [Attack Protection](https://supabase.com/dashboard/project/mnevlegpkrncxlqkqdnl/auth/protection) → _Configure in email provider_.

1. Abra o provedor **Email**
2. Ative **Prevent use of leaked passwords** (HaveIBeenPwned)
3. Requer **Supabase Pro** — no Free o toggle fica desabilitado

Checklist completo Free vs Pro: [GO-LIVE-AUTH.md](./GO-LIVE-AUTH.md)

## Variáveis

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # apenas server / scripts
```

## Arquivos principais

| Arquivo                          | Papel                              |
| -------------------------------- | ---------------------------------- |
| `src/lib/supabase/client.ts`     | Browser client                     |
| `src/lib/supabase/server.ts`     | Server Components / Route Handlers |
| `src/lib/actions/auth.ts`        | Server Actions login/signup/logout |
| `src/app/auth/callback/route.ts` | OAuth code exchange                |
| `src/middleware.ts`              | Session refresh + guard `/app`     |

## Ver também

- [GO-LIVE-AUTH.md](./GO-LIVE-AUTH.md) — checklist 5 itens Free vs Pro
- [INTEGRATION.md](./INTEGRATION.md) — fluxo frontend ↔ API ↔ MCP
