# Go-live Auth — 5 itens (Free vs Pro)

Checklist comercial mínimo antes de abrir o Chefe da Casa ao público.  
Projeto Supabase: `mnevlegpkrncxlqkqdnl`

| #   | Item                            | Plano    | Onde configurar                                                                                                       | Impacto comercial                                          |
| --- | ------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 1   | **URLs de redirect OAuth**      | **Free** | Auth → [URL Configuration](https://supabase.com/dashboard/project/mnevlegpkrncxlqkqdnl/auth/url-configuration)        | Login Google quebra em produção sem isso → perda de signup |
| 2   | **Senha mínima + caracteres**   | **Free** | Auth → [Providers → Email](https://supabase.com/dashboard/project/mnevlegpkrncxlqkqdnl/auth/providers?provider=Email) | Reduz contas fracas e suporte por invasão                  |
| 3   | **Rate limits de auth**         | **Free** | Auth → [Rate Limits](https://supabase.com/dashboard/project/mnevlegpkrncxlqkqdnl/auth/rate-limits)                    | Anti brute-force; estabilidade sob tráfego                 |
| 4   | **Attack Protection (CAPTCHA)** | **Free** | Auth → [Attack Protection](https://supabase.com/dashboard/project/mnevlegpkrncxlqkqdnl/auth/protection)               | Bloqueia bots em signup/login → protege quota IA FREE      |
| 5   | **Leaked password protection**  | **Pro**  | Auth → Providers → Email → _Prevent use of leaked passwords_                                                          | Padrão OWASP/NIST; exige upgrade Supabase Pro              |

## Detalhe por item

### 1. URL Configuration (Free) — fazer agora em dev/staging

```text
Site URL:        https://seu-dominio.com
Redirect URLs:   https://seu-dominio.com/auth/callback
                 http://localhost:3000/auth/callback
                 https://*.vercel.app/auth/callback
```

**Validar:** login com Google em preview Vercel e em localhost.

### 2. Password strength (Free)

No provedor **Email**:

- Minimum length: **8** (recomendado 10+)
- Required characters: **digits + lower + upper + symbols** (máximo disponível)

**Validar:** tentar cadastro com senha `123456` → deve rejeitar.

### 3. Rate Limits (Free)

Valores sugeridos para lançamento:

- Sign-ups: limitar por IP (ex. 30/h)
- Sign-ins: limitar por IP (ex. 60/h)
- Password recovery: conservador (ex. 5/h)

**Validar:** múltiplos logins errados → resposta 429 ou bloqueio temporário.

### 4. Attack Protection / CAPTCHA (Free)

1. Crie chaves em [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile) (grátis)
2. Supabase → [Attack Protection](https://supabase.com/dashboard/project/mnevlegpkrncxlqkqdnl/auth/protection) → cole **Secret Key**
3. Ative em **Sign up** e **Sign-in**
4. No app (`.env`): `NEXT_PUBLIC_TURNSTILE_SITE_KEY=sua_site_key`

O código já envia o token nos formulários de login, cadastro, Google OAuth e recuperação de senha.

**Validar:** widget Turnstile aparece nos formulários; login funciona após marcar o captcha.

### 5. Leaked passwords (Pro)

1. Auth → **Providers → Email**
2. Ativar **Prevent use of leaked passwords** (HaveIBeenPwned)
3. Ou via **Attack Protection** → link _Configure in email provider_

> No plano **Free** o toggle fica desabilitado. Para go-live comercial pleno, considere **Supabase Pro** (~$25/mês) só por este item + limites maiores.

**Validar:** cadastro com senha conhecida vazada (ex. `password123`) → rejeitado no Pro.

---

## O que já está no código (não precisa Dashboard)

| Proteção                 | Onde                        |
| ------------------------ | --------------------------- |
| Guard `/app/*`           | `src/middleware.ts`         |
| API 401 sem sessão       | `requireAuthUser()`         |
| RLS em todas as tabelas  | migrations Supabase         |
| Redirect login no client | `src/lib/api/client.ts`     |
| Service role só server   | `src/lib/supabase/admin.ts` |

---

## Ordem recomendada

```text
Dev/beta     → 1 + 2 + 3
Pré-lançamento → 4 (CAPTCHA)
Go-live pago   → 5 (upgrade Pro) + revisar Audit Logs
```

## Comandos de integração (MCP + app)

```bash
npm run integration:mcp    # tipos + advisors + smoke
npm run test:smoke         # fluxo API autenticado
npm run typecheck
```

## Ver também

- [AUTH.md](./AUTH.md) — fluxos e arquivos
- [INTEGRATION.md](./INTEGRATION.md) — frontend ↔ backend via MCP
- [LAUNCH.md](./LAUNCH.md) — checklist completo de lançamento
