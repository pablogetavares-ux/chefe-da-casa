# Auditoria — Chef da Casa AI

Última revisão: **30 maio/2026** · Supabase `mnevlegpkrncxlqkqdnl` · Projeto em `C:\dev\chef-da-casa`

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
| OneDrive + `.next`                   | ⚠️     | Desenvolver em `C:\dev\chef-da-casa`                    |
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

### 7. Arquitetura (saudável)

```
Browser / Mobile
  → API v1 (auth cookie ou Bearer)
  → Supabase Postgres + RLS
Webhooks (Stripe, RevenueCat) → service role → profiles.plan
```

## Comandos de verificação

```bash
cd C:\dev\chef-da-casa
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
3. Abrir workspace **`C:\dev\chef-da-casa`** no Cursor
4. `git remote add` + push antes do deploy Vercel
5. E2E com credenciais: `npm run test:e2e` (requer env de teste)
