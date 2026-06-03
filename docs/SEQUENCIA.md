# Sequência do projeto — Chef da Casa

Guia prático do que já existe e o que fazer em seguida (maio/2026).

## Estado atual

| Área                                   | Status                                   |
| -------------------------------------- | ---------------------------------------- |
| Auth (email, Google, perfil)           | ✅                                       |
| Despensa, receitas, favoritos, IA      | ✅                                       |
| Lista inteligente, ofertas, comparador | ✅ (comparador Premium no web)           |
| Billing web (Stripe)                   | ✅ código · ⚠️ configurar chaves         |
| Billing mobile (RevenueCat)            | ✅ código · ⚠️ Play + RevenueCat         |
| Deploy / go-live                       | 📋 checklist em [LAUNCH.md](./LAUNCH.md) |

**Desenvolvimento:** `C:\dev\chef-da-casa` (não OneDrive).

## Ordem recomendada

### Agora (local)

```bash
cd C:\dev\chef-da-casa
yarn dev
```

1. Testar fluxos: login → gerar receita → despensa → lista → ofertas
2. Perfil → plano e limites (card de uso no Início)
3. Comparador (`/app/compare`) — Premium; gratuito vê CTA de upgrade

### Curto prazo (1–2 semanas)

1. **Git remoto** — `git remote add origin …` + push
2. **Supabase Auth** — [ativar leaked password protection](https://supabase.com/dashboard/project/mnevlegpkrncxlqkqdnl/auth/providers)
3. **Stripe test** — checkout Pro em `/pricing` ([BILLING.md](./BILLING.md))
4. **Deploy Vercel** — env de `.env.production.example` ([DEPLOY.md](./DEPLOY.md))

### Médio prazo

1. **App Android** — `apps/mobile`, RevenueCat + Google Play ([BILLING-MOBILE.md](./BILLING-MOBILE.md))
2. **Upstash** — rate limit entre instâncias
3. **Sentry** — erros em produção
4. **E2E** — `npm run test:e2e` com env de CI

### Verificação contínua

```bash
npm run validate
npm run test
npm run integration:mcp   # com yarn dev rodando
npm run production:check  # antes do deploy
```

## Comandos úteis

| Comando                                | Uso                            |
| -------------------------------------- | ------------------------------ |
| `yarn dev`                             | Servidor local                 |
| `npm run dev:mobile`                   | Next na rede (celular browser) |
| `npm --prefix apps/mobile run android` | App nativo (após prebuild)     |
| `npm run db:types:mcp`                 | Atualizar tipos Supabase       |

## Documentação relacionada

- [AUDIT.md](./AUDIT.md) — auditoria e riscos
- [ARCHITECTURE.md](../ARCHITECTURE.md) — estrutura
- [ROADMAP.md](./ROADMAP.md) — fases (atualizado)
