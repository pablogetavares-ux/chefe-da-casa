# Teste no celular (Android) — Chefe da Casa

Guia para validar o app no navegador Android (testado com perfil **Motorola Moto G75**: 412×915 CSS, Android 14).

## 1. Subir o servidor na rede local

No PC (mesma Wi‑Fi do celular):

```bash
npm run dev:mobile
```

O terminal exibe algo como:

```text
→ http://192.168.x.x:3000/login
→ http://192.168.x.x:3000/app
```

**No Moto G75:** abra o **Chrome** e cole a URL exata (use `http`, não `https`).

### Requisitos

| Item     | Detalhe                                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------------------------- |
| Wi‑Fi    | PC e celular na **mesma rede**                                                                                      |
| Firewall | `dev:mobile` tenta liberar a porta 3000 no Windows; se falhar, execute o terminal como Administrador                |
| OneDrive | Se o projeto está no OneDrive, `npm run dev` usa `C:\dev\chefe-da-casa` — rode `dev:mobile` a partir da pasta ativa |

## 2. Variáveis para login no celular

Para **login/cadastro** funcionar no Android em dev, o Supabase precisa aceitar a URL da rede local.

1. Copie o IP exibido por `dev:mobile` (ex.: `http://192.168.0.42:3000`).
2. No [Supabase → Auth → URL Configuration](https://supabase.com/dashboard/project/mnevlegpkrncxlqkqdnl/auth/url-configuration):
   - **Site URL:** `http://192.168.x.x:3000` (temporário para teste)
   - **Redirect URLs:** adicione `http://192.168.x.x:3000/auth/callback`
3. Opcional: no `.env` local, `NEXT_PUBLIC_APP_URL=http://192.168.x.x:3000` enquanto testar no celular.

> Em produção use sempre o domínio real (`https://seu-dominio.com`).

## 3. O que validar no Moto G75

- [ ] Landing `/` legível, sem scroll horizontal
- [ ] Login e cadastro completam o redirect
- [ ] Barra inferior (Início, Gerar, Ofertas, Compras, Perfil) clicável
- [ ] Menu hambúrguer abre e fecha
- [ ] Banner de cookies **não cobre** a barra inferior
- [ ] Conteúdo não fica escondido atrás da nav inferior ao rolar
- [ ] Alternar tema (ícone sol/lua no header mobile)

## 4. Testes automatizados (viewport Moto G75)

Simula o viewport do Moto G75 no Playwright:

```bash
# Com o servidor rodando (dev ou start)
npm run test:e2e -- --project=moto-g75
```

Perfil: **412×915**, touch, Android 14, `deviceScaleFactor: 2.625`.

## 5. Instalar como PWA (opcional)

No Chrome do Moto G75: menu ⋮ → **Instalar app** ou **Adicionar à tela inicial** (quando disponível).

## Melhorias mobile aplicadas no código

- Barra de tema só no desktop; no celular, tema no header do app
- Texto da nav inferior em `text-xs` (12px) e alvos de toque ≥ 44px
- Cookies posicionados acima da barra inferior nas rotas `/app`
- `viewport-fit: cover` + `safe-area-inset` para barra de gestos
- Altura com `100dvh` (evita corte pela barra de endereço do Chrome)

## Problemas comuns

| Sintoma                  | Solução                                                     |
| ------------------------ | ----------------------------------------------------------- |
| Celular não abre a URL   | Mesma Wi‑Fi, firewall, use `dev:mobile` (não `dev` simples) |
| Login volta com erro     | Ajuste Site URL / Redirect no Supabase                      |
| Página “cortada” embaixo | Atualize o app (F5); padding usa `safe-area-inset-bottom`   |
| Tudo minúsculo           | Configurações Android → Tamanho da fonte / Zoom do Chrome   |
