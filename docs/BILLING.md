# Billing — Stripe (web) + RevenueCat (mobile)

- **Web:** Stripe Checkout, Customer Portal e webhooks → `subscriptions` + `profiles.plan`
- **Mobile (Expo):** RevenueCat + Google Play → `mobile_subscriptions` + `profiles.plan` — ver [BILLING-MOBILE.md](./BILLING-MOBILE.md)

## Variáveis de ambiente

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_FAMILY=price_...
SUPABASE_SERVICE_ROLE_KEY=...   # webhooks escrevem via service role (RLS bypass)
```

Copie `.env.example` → `.env` e preencha.

## Fluxo

1. Usuário clica **Assinar** em `/pricing` ou `/app/profile`
2. `POST /api/v1/billing/checkout` cria sessão Stripe
3. Após pagamento → redirect `/app/profile?billing=success`
4. Webhook `checkout.session.completed` sincroniza assinatura
5. `profiles.plan` atualizado → limites de IA aplicados via `getAiUsageSummary`

## Endpoints

| Método | Rota                           | Descrição                                         |
| ------ | ------------------------------ | ------------------------------------------------- |
| GET    | `/api/v1/billing/subscription` | Plano + assinatura atual                          |
| POST   | `/api/v1/billing/checkout`     | Inicia checkout (`{ planId: "pro" \| "family" }`) |
| POST   | `/api/v1/billing/portal`       | Abre portal Stripe (gerenciar/cancelar)           |
| POST   | `/api/webhooks/stripe`         | Webhook (raw body + assinatura)                   |

## Configurar Stripe Dashboard

1. **Products & Prices** — criar preços mensais Pro e Família
2. **Webhooks** — endpoint `https://SEU-DOMINIO/api/webhooks/stripe`
   - Eventos: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
3. **Customer Portal** — habilitar cancelamento e atualização de pagamento

### Desenvolvimento local

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Use o `whsec_...` exibido como `STRIPE_WEBHOOK_SECRET`.

## Planos

Definição em `src/config/plans.ts`. Mapeamento Stripe em `src/lib/stripe/config.ts`.

| Plano    | Enum DB | Price env           |
| -------- | ------- | ------------------- |
| Gratuito | FREE    | —                   |
| Pro      | PRO     | STRIPE_PRICE_PRO    |
| Família  | FAMILY  | STRIPE_PRICE_FAMILY |

## Segurança

- Webhooks validam assinatura Stripe
- Escritas em `subscriptions` e `profiles.plan` só via **service role**
- Usuário autenticado só lê própria assinatura (RLS)

## UI

- `/app/profile` — editar nome, trocar senha, assinar/gerenciar plano
- `/pricing` — botões de upgrade (checkout se logado, signup se não)
