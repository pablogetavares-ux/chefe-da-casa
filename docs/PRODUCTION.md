# Produção — Chef da Casa AI

Guia completo para deploy profissional na Vercel.

## Checklist pré-deploy

```bash
npm run validate          # typecheck + lint + format
npm run build             # build de produção
npm run deploy:check:prod # env obrigatória produção
npm run production:check  # env + health remoto (após deploy)
npm run phase1:check -- --smoke  # integração local (requer service role)
```

| Item              | Status código                                           | Ação manual                               |
| ----------------- | ------------------------------------------------------- | ----------------------------------------- |
| Build otimizada   | `next.config.ts` — compress, AVIF/WebP, package imports | —                                         |
| Região Vercel     | `vercel.json` → `gru1`                                  | —                                         |
| Timeout IA (60s)  | `vercel.json` + `maxDuration` nas rotas                 | Plano Vercel Pro para >10s                |
| Env vars          | `.env.example`                                          | Vercel → Settings → Environment Variables |
| Logs JSON         | `src/lib/observability/logger.ts`                       | Vercel → Logs                             |
| Sentry (opcional) | `SENTRY_DSN` + `instrumentation.ts`                     | [sentry.io](https://sentry.io)            |
| Analytics         | `@vercel/analytics` + Speed Insights                    | Ativo automaticamente na Vercel           |
| CI/CD             | `.github/workflows/ci.yml`                              | Push em `main`                            |
| SEO               | metadata, sitemap, robots, OG, JSON-LD                  | —                                         |
| Favicon/PWA       | `icon.tsx`, `apple-icon.tsx`, `manifest.ts`             | —                                         |
| Health            | `GET /api/health`                                       | Uptime monitor (UptimeRobot, etc.)        |
| Segurança         | RLS, audit tables, CSRF, headers                        | Supabase Dashboard                        |

## Variáveis de ambiente (Production)

Copie de `.env.example`. Obrigatórias em produção:

```env
NEXT_PUBLIC_APP_URL=https://seu-dominio.com.br
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
ADMIN_EMAILS=admin@empresa.com
BILLING_DEV_MOCK=false
AI_DEV_MOCK=false
```

Recomendadas:

```env
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_PRO=
STRIPE_PRICE_FAMILY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
```

## Deploy Vercel

1. Importe o repositório em [vercel.com/new](https://vercel.com/new)
2. Framework: **Next.js** (auto-detectado)
3. Configure env vars para **Production** e **Preview**
4. Deploy → verifique `GET /api/health` → `readyForAi: true`

Detalhes: [DEPLOY.md](./DEPLOY.md)

## Domínio customizado

1. Vercel → Project → **Settings → Domains**
2. Adicione `seu-dominio.com.br` e `www`
3. Configure DNS (CNAME ou A record conforme Vercel indicar)
4. Atualize `NEXT_PUBLIC_APP_URL` para o domínio final
5. Supabase → Auth → URL Configuration → Site URL + Redirect URLs
6. Stripe → Webhook URL com o novo domínio

## Monitoramento

| Canal             | Uso                                  |
| ----------------- | ------------------------------------ |
| `GET /api/health` | Uptime + Supabase + service role     |
| Vercel Logs       | Logs JSON estruturados (`logger.*`)  |
| Vercel Analytics  | Pageviews (automático em produção)   |
| Speed Insights    | Core Web Vitals (automático)         |
| Sentry            | Erros server + client (`SENTRY_DSN`) |
| `/app/admin`      | Métricas internas (`ADMIN_EMAILS`)   |

### Uptime externo (recomendado)

Configure alerta em [UptimeRobot](https://uptimerobot.com) ou similar:

- URL: `https://seu-dominio.com/api/health`
- Intervalo: 5 min
- Alerta se status ≠ 200 ou `readyForAi: false`

## Performance

- Imagens: AVIF/WebP via `next/image`
- Code splitting: rotas pesadas com `next/dynamic`
- Cache: `/_next/static` 1 ano; APIs `no-store`
- Rate limit: Upstash em produção (fallback memória por instância)
- Região `gru1` alinhada ao Supabase sa-east-1

## SEO

- `/` e `/pricing` indexáveis; `/app/*` e `/api/*` bloqueados em `robots.ts`
- OG dinâmico: `/opengraph-image`
- Sitemap: `src/app/sitemap.ts`
- JSON-LD: home + pricing

## Migrations Supabase

Aplique em ordem (`supabase/migrations/`). Críticas:

- `20260524100000_production_saas_hardening.sql`
- `20260524130000_security_audit_tables.sql`

```bash
npm run db:types
```

## Supabase Dashboard (manual)

- [ ] Leaked Password Protection (Auth → Providers → Email)
- [ ] Redirect URLs com domínio de produção
- [ ] Migrations aplicadas

## Limites por plano

| Plano   | IA/mês | Receitas/mês | Favoritos | Despensa |
| ------- | ------ | ------------ | --------- | -------- |
| FREE    | 10     | 5            | 10        | 20       |
| PRO     | 200    | 100          | 500       | 200      |
| FAMÍLIA | 600    | 300          | ∞         | ∞        |

## Segurança produção

- `BILLING_DEV_MOCK=false` e `AI_DEV_MOCK=false`
- `ADMIN_EMAILS` definido
- `SUPABASE_SERVICE_ROLE_KEY` apenas server-side
- Audit tables (`ai_generations`, `usage_logs`, `ingredient_scans`) — writes só via service role
- CSRF: middleware bloqueia Origin inválido em mutações `/api/v1/*`

## GitHub Actions — secrets opcionais (E2E completo)

Para rodar `e2e-full` no CI (cadastro + IA + favoritos), configure em **Settings → Secrets**:

| Secret                          | Uso                   |
| ------------------------------- | --------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Projeto Supabase real |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon            |
| `SUPABASE_SERVICE_ROLE_KEY`     | Rotas de IA no teste  |

Sem secrets, o CI roda **E2E público** (landing, pricing, health) automaticamente.

## Rollback

1. Vercel → Deployments → deployment anterior → **Promote to Production**
2. Se migration quebrou: revert SQL no Supabase ou restore backup

Ver também: [DEPLOY.md](./DEPLOY.md), [BILLING.md](./BILLING.md), [AUTH.md](./AUTH.md), [AUDIT.md](./AUDIT.md)
