# Desenvolvimento local

**Use esta pasta:** `C:\dev\chef-da-casa`

O projeto foi copiado para fora do OneDrive para evitar lentidão e erros no `yarn dev`.

## Comandos

```powershell
cd C:\dev\chef-da-casa
yarn dev
```

## No Cursor

**File → Open Folder** → `C:\dev\chef-da-casa`

Não abra mais `OneDrive\Documents\projetos\chef-da-casa` para desenvolver.

## Se `yarn dev` falhar com exit code 1

```powershell
node scripts/kill-port.mjs 3000
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
yarn dev
```
