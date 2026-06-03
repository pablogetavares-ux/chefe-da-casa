# Deploy — Vercel

Guia para colocar o **Chef da Casa AI** em produção na Vercel, integrado com Supabase (sa-east-1) e Stripe.

## Pré-requisitos

- Repositório Git (GitHub recomendado)
- Conta [Vercel](https://vercel.com) conectada ao GitHub
- Projeto Supabase `mnevlegpkrncxlqkqdnl` (sa-east-1) ativo
- (Opcional) Conta Stripe para billing

## 1. Verificar localmente

```bash
npm run validate
npm run build
npm run deploy:check
```

## 2. Conectar repositório à Vercel

1. [vercel.com/new](https://vercel.com/new) → Import Git Repository
2. Framework: **Next.js** (detectado automaticamente)
3. **Root Directory:** `.` (raiz do repo)
4. **Build Command:** `npm run build` (padrão)
5. **Output Directory:** `.next` (padrão Next.js)
6. **Install Command:** `npm install` (padrão)

A região padrão das functions está em `vercel.json` → **`gru1`** (São Paulo), próxima ao Supabase sa-east-1.

## 3. Variáveis de ambiente na Vercel

**Project → Settings → Environment Variables**

Use o template **`.env.production.example`** como base. Configure para **Production**:

| Variável                   | Produção       | Notas                                                                 |
| -------------------------- | -------------- | --------------------------------------------------------------------- |
| `AI_DEV_MOCK`              | **`false`**    | Mock de IA nunca roda em produção (código bloqueia)                   |
| `BILLING_DEV_MOCK`         | **`false`**    | Mock de billing nunca roda em produção                                |
| `UPSTASH_REDIS_REST_URL`   | Recomendado    | [console.upstash.com](https://console.upstash.com) → Redis → REST API |
| `UPSTASH_REDIS_REST_TOKEN` | Par do Upstash | Rate limit entre instâncias Vercel                                    |

### Validar antes do deploy

```bash
npm run deploy:check:prod      # env local simulando produção
npm run production:check       # env + GET /api/health remoto (após deploy)
```

Endpoints de diagnóstico:

- `GET /api/health` — Supabase + `readyForProduction`, `blockers`, `warnings`
- `GET /api/v1/status` — detalhe de serviços (OpenAI, Stripe, Upstash, mocks)

Configure para **Production** (e **Preview** se quiser PRs funcionando):

| Variável                        | Obrigatória | Escopo     | Notas                                            |
| ------------------------------- | ----------- | ---------- | ------------------------------------------------ |
| `NEXT_PUBLIC_APP_URL`           | ✅          | Production | URL final, ex: `https://chef-da-casa.vercel.app` |
| `NEXT_PUBLIC_APP_NAME`          | —           | All        | `Chef da Casa AI`                                |
| `NEXT_PUBLIC_SUPABASE_URL`      | ✅          | All        | Dashboard Supabase → Settings → API              |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅          | All        | Chave **anon/public**                            |
| `SUPABASE_SERVICE_ROLE_KEY`     | ✅\*        | Production | Webhooks Stripe; **nunca** expor no client       |
| `OPENAI_API_KEY`                | ✅\*        | Production | Geração de receitas IA                           |
| `OPENAI_MODEL`                  | —           | All        | Default: `gpt-4o-mini`                           |
| `STRIPE_SECRET_KEY`             | Billing     | Production | `sk_live_...` ou `sk_test_...`                   |
| `STRIPE_WEBHOOK_SECRET`         | Billing     | Production | Do endpoint webhook Stripe                       |
| `STRIPE_PRICE_PRO`              | Billing     | Production | `price_...`                                      |
| `STRIPE_PRICE_FAMILY`           | Billing     | Production | `price_...`                                      |
| `ADMIN_EMAILS`                  | Produção    | Production | E-mails admin separados por vírgula              |
| `BILLING_DEV_MOCK`              | —           | Production | `false` em produção                              |
| `AI_DEV_MOCK`                   | —           | Production | `false` em produção                              |
| `UPSTASH_REDIS_REST_URL`        | Recom.      | Production | Rate limit distribuído                           |
| `UPSTASH_REDIS_REST_TOKEN`      | Recom.      | Production | Par do Upstash                                   |
| `SENTRY_DSN`                    | Opcional    | Production | Erros server-side                                |
| `NEXT_PUBLIC_SENTRY_DSN`        | Opcional    | All        | Erros client-side (mesmo DSN Sentry)             |

\* Obrigatória para funcionalidade completa; build passa sem OpenAI/Stripe.

### Validar antes do deploy

```bash
npm run deploy:check:prod   # simula checagem de produção
```

### Monitoramento pós-deploy

- Health: `GET https://SEU-DOMINIO/api/health` → `readyForAi: true`
- Vercel Analytics + Speed Insights: automáticos em produção
- Sentry: configure `SENTRY_DSN` (ver `docs/PRODUCTION.md`)

### Preview deployments

Para PR previews, use as **mesmas** credenciais Supabase ou um projeto Supabase de staging.  
Atualize `NEXT_PUBLIC_APP_URL` por ambiente na Vercel (Production vs Preview).

## 4. Supabase — URLs de redirect

**Authentication → URL Configuration**

| Campo         | Valor                                                   |
| ------------- | ------------------------------------------------------- |
| Site URL      | `https://SEU-DOMINIO.vercel.app`                        |
| Redirect URLs | `https://SEU-DOMINIO.vercel.app/auth/callback`          |
|               | `https://SEU-DOMINIO.vercel.app/**` (wildcard opcional) |

Inclua também URLs de **Preview** se testar auth em PRs:

```
https://*.vercel.app/auth/callback
```

## 5. Stripe — Webhook de produção

### 5.1 Produtos e preços (Live mode)

1. Stripe Dashboard → **Developers → API keys** → copie `sk_live_...` e `pk_live_...`
2. **Product catalog** → crie **Pro** (R$ 29,90/mês) e **Família** (R$ 49,90/mês)
3. Copie os `price_...` → `STRIPE_PRICE_PRO` e `STRIPE_PRICE_FAMILY`
4. **Settings → Customer portal** → habilite cancelamento e atualização de cartão

### 5.2 Webhook

**Developers → Webhooks → Add endpoint**

| Campo   | Valor                                                |
| ------- | ---------------------------------------------------- |
| URL     | `https://SEU-DOMINIO.vercel.app/api/webhooks/stripe` |
| Eventos | `checkout.session.completed`                         |
|         | `customer.subscription.created`                      |
|         | `customer.subscription.updated`                      |
|         | `customer.subscription.deleted`                      |

Copie o **Signing secret** (`whsec_...`) → `STRIPE_WEBHOOK_SECRET` na Vercel.

### 5.3 Upstash (rate limit)

1. [console.upstash.com](https://console.upstash.com) → **Create database** (região próxima a `gru1`)
2. Aba **REST API** → copie `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`
3. Cole na Vercel (Production)

Redeploy após alterar env vars: **Deployments → ⋮ → Redeploy**.

## 6. Deploy

### Via Git (recomendado)

```bash
git push origin main
```

Cada push em `main`/`master` dispara deploy automático.

### Via CLI (alternativa)

```bash
npx vercel login
npx vercel link
npx vercel env pull .env.local   # opcional: sync env local
npx vercel --prod
```

## 7. Pós-deploy — checklist

- [ ] `GET https://SEU-DOMINIO/api/health` → `"status": "ok"`
- [ ] Landing `/` carrega
- [ ] Signup + login em `/signup` e `/login`
- [ ] `/app` protegido (redirect se não logado)
- [ ] Despensa CRUD
- [ ] Gerar receita IA (requer `OPENAI_API_KEY`)
- [ ] Checkout Stripe (requer env billing)
- [ ] Webhook Stripe recebe evento (Dashboard → Webhooks → eventos)

## 8. CI no GitHub

Workflow `.github/workflows/ci.yml`:

- **validate** — typecheck + lint + format
- **build** — `npm run build` (smoke test de produção)

Rode após conectar o repo ao GitHub.

## 9. Domínio customizado (opcional)

Vercel → **Settings → Domains** → adicionar domínio.

Atualize:

1. `NEXT_PUBLIC_APP_URL` na Vercel
2. Site URL + Redirect URLs no Supabase
3. Webhook URL no Stripe

## 10. Troubleshooting

| Problema                                      | Solução                                               |
| --------------------------------------------- | ----------------------------------------------------- |
| Build falha: Missing `NEXT_PUBLIC_SUPABASE_*` | Definir env vars antes do build                       |
| Auth redirect loop                            | Conferir Redirect URLs no Supabase                    |
| Stripe webhook 503                            | `SUPABASE_SERVICE_ROLE_KEY` + `STRIPE_WEBHOOK_SECRET` |
| IA não gera                                   | `OPENAI_API_KEY` em Production                        |
| Sessão não persiste                           | Cookies OK em HTTPS; conferir `NEXT_PUBLIC_APP_URL`   |

## Referências

- [docs/AUTH.md](./AUTH.md) — fluxos de autenticação
- [docs/BILLING.md](./BILLING.md) — Stripe e planos
- [.env.example](../.env.example) — template de variáveis
