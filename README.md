# Chefe da Casa

> **Desenvolvimento:** use `C:\dev\chefe-da-casa` · sequência do projeto: [docs/SEQUENCIA.md](docs/SEQUENCIA.md)

SaaS culinário com IA — crie receitas saudáveis com os ingredientes que você já tem em casa.

## Stack

- **Next.js 16** · TypeScript · TailwindCSS 4 · shadcn/ui
- **Supabase** · PostgreSQL · Prisma
- **OpenAI** · React Query · Zustand · Framer Motion

## Início rápido

```bash
# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env

# Gerar cliente Prisma
npm run db:generate

# Desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### Testar no Android (Moto G75 e similares)

```bash
npm run dev:mobile   # expõe na rede local (mesma Wi‑Fi)
```

Guia completo: [docs/MOBILE-DEV.md](./docs/MOBILE-DEV.md)

## Documentação

| Documento                                    | Descrição                                 |
| -------------------------------------------- | ----------------------------------------- |
| [docs/SETUP.md](./docs/SETUP.md)             | **Ambiente, aliases, scripts, providers** |
| [ARCHITECTURE.md](./ARCHITECTURE.md)         | Arquitetura e decisões                    |
| [docs/ROADMAP.md](./docs/ROADMAP.md)         | Roadmap técnico                           |
| [docs/CONVENTIONS.md](./docs/CONVENTIONS.md) | Convenções de código                      |
| [docs/DEPLOY.md](./docs/DEPLOY.md)           | **Deploy Vercel + checklist**             |
| [docs/BILLING.md](./docs/BILLING.md)         | Stripe e planos                           |
| [docs/AUTH.md](./docs/AUTH.md)               | Autenticação Supabase                     |
| [docs/MOBILE-DEV.md](./docs/MOBILE-DEV.md)   | **Teste no celular Android**              |

## Scripts

| Comando                | Descrição                       |
| ---------------------- | ------------------------------- |
| `npm run dev`          | Servidor de desenvolvimento     |
| `npm run dev:mobile`   | Dev na rede local (celular)     |
| `npm run build`        | Build de produção               |
| `npm run lint`         | ESLint                          |
| `npm run lint:fix`     | ESLint com auto-fix             |
| `npm run format`       | Prettier (write)                |
| `npm run typecheck`    | Verificação TypeScript          |
| `npm run validate`     | typecheck + lint + format check |
| `npm run deploy:check` | Verificar env antes do deploy   |
| `npm run db:migrate`   | Aplicar migrações               |
| `npm run db:studio`    | Prisma Studio                   |

## Roadmap

- **Fase 0** ✅ Fundação
- **Fase 1** Infraestrutura & Database
- **Fase 2** Autenticação
- **Fase 3** SaaS & Billing
- **Fase 4** Despensa
- **Fase 5** Receitas & IA
- **Fase 6** Launch

Ver [docs/ROADMAP.md](./docs/ROADMAP.md) para detalhes.

## Deploy (Vercel)

```bash
npm run deploy:check   # validar variáveis
npm run build          # smoke test local
```

Guia completo: [docs/DEPLOY.md](./docs/DEPLOY.md) — env vars, Supabase redirects, Stripe webhook e checklist pós-deploy.

## Licença

Privado — todos os direitos reservados.
