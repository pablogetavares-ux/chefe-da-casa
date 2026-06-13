# Go-live — Chefe da Casa

Checklist para lançamento comercial. O código está completo; o restante é configuração externa.

## Comandos

```bash
npm run validate          # typecheck + lint + format
npm run test              # testes unitários
npm run build             # build de produção
npm run deploy:check:prod # env obrigatória
npm run launch:check      # checklist Fase 2 (local + remoto)
npm run production:check  # após deploy com URL real
```

## API de checklist

| Endpoint                       | Uso                                       |
| ------------------------------ | ----------------------------------------- |
| `GET /api/health`              | Uptime + Supabase + prontidão IA/billing  |
| `GET /api/v1/status`           | Blockers e warnings de produção           |
| `GET /api/v1/launch-checklist` | Passos manuais vs código (URLs incluídas) |

## Passos manuais (ordem)

### 1. Vercel

- Importar repositório, região `gru1`
- Copiar variáveis de `.env.production.example`
- `AI_DEV_MOCK=false`, `BILLING_DEV_MOCK=false`
- Domínio customizado → atualizar `NEXT_PUBLIC_APP_URL`

### 2. Supabase Auth

Dashboard: [URL Configuration](https://supabase.com/dashboard/project/mnevlegpkrncxlqkqdnl/auth/url-configuration)

- **Site URL:** `https://seu-dominio.com`
- **Redirect URLs:** `https://seu-dominio.com/auth/callback`

Dashboard: [Auth Providers](https://supabase.com/dashboard/project/mnevlegpkrncxlqkqdnl/auth/providers)

- Habilitar **Leaked Password Protection**

### 3. Stripe (live)

- API keys: `sk_live_` + `pk_live_`
- Produtos Pro e Família → `STRIPE_PRICE_PRO`, `STRIPE_PRICE_FAMILY`
- Webhook: `https://seu-dominio.com/api/webhooks/stripe`
  - Eventos: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_failed`
- Customer Portal habilitado

### 4. Opcional recomendado

- **Upstash** — rate limit distribuído
- **Sentry** — `SENTRY_DSN` + `NEXT_PUBLIC_SENTRY_DSN`
- **UptimeRobot** — monitor em `/api/health`

## Critério de pronto

`GET /api/v1/launch-checklist` retorna:

- `codeComplete: true`
- `readyToLaunch: true`
- `stripe.liveMode: true`

Ver também: [DEPLOY.md](./DEPLOY.md), [PRODUCTION.md](./PRODUCTION.md), [BILLING.md](./BILLING.md)
