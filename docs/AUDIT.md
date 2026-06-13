# Auditoria — Chefe da Casa

Última revisão: **30 maio/2026** · Supabase `mnevlegpkrncxlqkqdnl` · Projeto em `C:\dev\chefe-da-casa`

## Resumo executivo

| Área                  | Status | Notas                                                         |
| --------------------- | ------ | ------------------------------------------------------------- |
| TypeScript strict     | ✅     | `npm run typecheck`                                           |
| Testes unitários (45) | ✅     | Vitest                                                        |
| Build produção        | ✅     | `yarn build`                                                  |
| Integração MCP script | ✅     | 41+ checks HTTP + schema                                      |
| RLS Supabase          | ✅     | Advisors MCP revisados                                        |
| Código sem TODO/FIXME | ✅     | Busca em `src/`                                               |
| App mobile Expo       | ⚠️     | Fora do lint root; requer `expo prebuild` + chaves RevenueCat |
| Go-live produção      | ⚠️     | Mocks ativos, Stripe/OpenAI incompletos no `.env` local       |

## Tipos de problemas mapeados

### 1. Gaps (funcionalidade / produto)

| Gap                                       | Severidade | Detalhe                                                |
| ----------------------------------------- | ---------- | ------------------------------------------------------ |
| Billing Stripe não configurado localmente | Média      | `STRIPE_*` vazios — checkout web desabilitado          |
| RevenueCat mobile                         | Média      | Backend pronto; falta configurar Play Console + chaves |
| App mobile incompleto                     | Média      | Shell Expo + billing; não replica todo o web           |
| Rate limit distribuído                    | Baixa      | Upstash ausente — limite só por instância              |
| Gemini / capas de receita                 | Baixa      | `RECIPE_IMAGES_ENABLED` opcional pós go-live           |
| Git remote                                | Baixa      | Repositório local sem `origin`                         |

### 2. Bugs corrigidos nesta auditoria

| Bug                                            | Correção                                                                    |
| ---------------------------------------------- | --------------------------------------------------------------------------- |
| `revenuecat_webhook_events` com RLS sem policy | Policy `revenuecat_webhook_events_deny` (MCP)                               |
| FK `shopping_list_items.recipe_id` sem índice  | Índice parcial (MCP)                                                        |
| Rotas AI metadata sem Bearer token             | `recipe-mutation-route` usa `requireAuthUser(request)` + `createAuthClient` |
| `/api/v1/launch-checklist` exposto em produção | Admin-only quando `NODE_ENV=production`                                     |
| Lint mobile no monorepo web                    | `apps/mobile/**` ignorado no ESLint root                                    |

### 3. Crash / estabilidade

| Risco                                | Status | Mitigação                                               |
| ------------------------------------ | ------ | ------------------------------------------------------- |
| OneDrive + `.next`                   | ⚠️     | Desenvolver em `C:\dev\chefe-da-casa`                   |
| Webhook Stripe/RevenueCat sem secret | ✅     | Retorna 503 se não configurado                          |
| AI sem OpenAI em prod                | ✅     | `ensureOpenAiConfigured` + blockers no production-check |
| Erros não tratados em API            | ✅     | Padrão `apiError` / `mapAiRouteError`                   |
| `yarn dev` exit 1 em background      | Info   | Timeout do agente, não falha do app                     |

### 4. Segurança (Supabase MCP — security)

| Item                                       | Nível | Ação                                                                                                                                 |
| ------------------------------------------ | ----- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Leaked password protection desligado       | WARN  | [Ativar no Dashboard Auth](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) |
| `revenuecat_webhook_events` RLS sem policy | INFO  | **Corrigido** — deny anon/authenticated                                                                                              |
| Webhooks audit tables                      | ✅    | Mesmo padrão que `stripe_webhook_events`                                                                                             |
| `mobile_subscriptions`                     | ✅    | SELECT own; writes service role                                                                                                      |

### 5. Performance (Supabase MCP)

| Item                               | Nível | Ação                                       |
| ---------------------------------- | ----- | ------------------------------------------ |
| FK `shopping_list_items.recipe_id` | INFO  | **Corrigido** — índice criado              |
| Índices “unused”                   | INFO  | Normal em dev; reavaliar após tráfego real |

### 6. Configuração / deploy

Bloqueadores em produção (`npm run production:check`):

- `OPENAI_API_KEY`
- `BILLING_DEV_MOCK=false`, `AI_DEV_MOCK=false`
- `NEXT_PUBLIC_APP_URL` ≠ localhost
- Avisos: Stripe, Upstash, Sentry

### 8. Risco de exposição de dados multi-tenant (jun/2026)

Auditoria MCP (`execute_sql` + `get_advisors`) em **36 tabelas public** — todas com RLS habilitado.

| Área                       | Achado                                                                                                                 | Mitigação                                  |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| **RLS ausente**            | Nenhuma tabela nova sem RLS                                                                                            | —                                          |
| **Owner (`user_id`)**      | Catálogos compartilhados (`regional_offers`, `products`, `offer_verticals`) sem `user_id` — leitura global intencional | Dados sensíveis isolados por `auth.uid()`  |
| **Pagamentos**             | `subscriptions`, `mobile_subscriptions`: SELECT own; writes só service role                                            | Trigger `prevent_profile_plan_self_update` |
| **IA / prompts**           | `ai_generations`: SELECT own; INSERT/UPDATE client **revogados** (migration `20260611180000`)                          | API + service role                         |
| **Usage logs**             | INSERT direto client **revogado**; RPC `record_usage_log`                                                              | Evita inflar limites FREE                  |
| **Ofertas**                | `offer_favorites`, watchlist, alerts: RLS own; cashback sem INSERT client                                              | —                                          |
| **Vazamento entre planos** | `profiles.plan` protegido por trigger; features premium gated na API                                                   | Revisar novas rotas premium                |
| **Performance hub**        | RPC `count_active_offers_by_vertical` + índice parcial                                                                 | Substitui scan completo                    |

**Residual:** Auth leaked-password (Supabase Pro); rate limit CRUD sem Upstash; premium gates dependem de checagem na API (não RLS por plano).

### 9. Falhas em fluxo crítico de usuário (jun/2026)

Matriz de cenários de erro real, comportamento esperado e status de implementação.

| Cenário                                        | Comportamento esperado                                                                                                         | Status |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------ |
| **Sem internet / fetch falha**                 | Mensagem amigável; banner offline no app; retry automático ao reconectar (`refetchOnReconnect` + `NetworkRecoveryListener`)    | ✅     |
| **Timeout de API (30s)**                       | `ApiClientError` `TIMEOUT`; toast e painel com botão "Tentar novamente"                                                        | ✅     |
| **IA erro / timeout (stream 120s)**            | SSE com `AbortSignal.timeout`; código `AI_TIMEOUT`; toast orientando nova tentativa                                            | ✅     |
| **Pagamento pendente (`INCOMPLETE`)**          | Banner app-wide + card em Meu plano; CTA portal/checkout                                                                       | ✅     |
| **Pagamento atrasado (`PAST_DUE` / `UNPAID`)** | Banner de regularização; portal Stripe; gate premium bloqueia se `UNPAID`                                                      | ✅     |
| **Premium inválido / plano dessincronizado**   | `PremiumFeatureGate` mostra "Sincronizando" + invalidar billing/plan-usage; API continua fonte de verdade (`PREMIUM_REQUIRED`) | ✅     |
| **Estado corrompido (JSON inválido)**          | `ApiClientError` `INVALID_RESPONSE`; sem crash silencioso                                                                      | ✅     |
| **Recovery automático**                        | React Query retry só para rede/timeout/5xx; refetch ao voltar online; botão retry em `AsyncPanel`                              | ✅     |

**Arquivos principais:** `src/lib/api/client-errors.ts`, `src/lib/billing/subscription-state.ts`, `src/components/shared/offline-banner.tsx`, `src/components/shared/billing-status-banner.tsx`, `src/shared/components/async-panel.tsx`.

```
Usuário offline → OfflineBanner
       ↓ volta online
NetworkRecoveryListener → refetch queries stale
API erro → classifyClientError → AsyncPanel / toast contextual
Billing INCOMPLETE/PAST_DUE → BillingStatusBanner → portal ou refetch
```

**Residual:** simular offline/timeout em E2E autenticado; reconciliar `profiles.plan` vs Stripe em job assíncrono dedicado (hoje depende de webhook + refetch manual).

```
Browser / Mobile
  → API v1 (auth cookie ou Bearer)
  → Supabase Postgres + RLS
Webhooks (Stripe, RevenueCat) → service role → profiles.plan
```

## Comandos de verificação

```bash
cd C:\dev\chefe-da-casa
npm run typecheck
npm run lint
npm test
npm run build
npm run integration:mcp   # servidor em localhost:3000
npm run production:check
```

## Migrations remotas vs locais

Remoto inclui `mobile_billing_revenuecat` e `audit_mcp_fixes_may2026`.  
Arquivos locais espelhados em `supabase/migrations/` e `prisma/migrations/`.

## Próximos passos recomendados

1. Ativar **leaked password protection** no Supabase Auth
2. Configurar **Stripe** ou manter só mobile billing em beta
3. Abrir workspace **`C:\dev\chefe-da-casa`** no Cursor
4. `git remote add` + push antes do deploy Vercel
5. E2E com credenciais: `npm run test:e2e` (requer env de teste)
