# Roadmap Técnico — Chef da Casa AI

> Atualizado **30/05/2026**. A maior parte das fases iniciais já está implementada.

## Fases

| Fase | Nome                      | Status                                   |
| ---- | ------------------------- | ---------------------------------------- |
| 0    | Fundação                  | ✅ Concluída                             |
| 1    | Infraestrutura & Database | ✅ Concluída                             |
| 2    | Autenticação & Perfis     | ✅ Concluída                             |
| 3    | SaaS & Billing            | ✅ Código · configurar Stripe/RevenueCat |
| 4    | Despensa (Pantry)         | ✅ Concluída                             |
| 5    | Receitas & IA             | ✅ Concluída                             |
| 6    | UX, Performance & Launch  | 🔄 Em andamento                          |

**Próximos passos detalhados:** [SEQUENCIA.md](./SEQUENCIA.md)

---

## Fase 6 — Em andamento

- [x] Home com uso do plano e atalhos
- [x] Comparador de preços (gate Premium web)
- [x] App mobile Expo + RevenueCat (scaffold)
- [x] Auditoria MCP + `C:\dev\chef-da-casa`
- [ ] Deploy Vercel + domínio
- [ ] Stripe live + webhooks produção
- [ ] Google Play + RevenueCat produção
- [ ] E2E CI estável
- [ ] Lighthouse / polish final

---

## Dependências

```
Fase 0–5 ✅  →  Fase 6 (launch)  →  Mobile store release
```
