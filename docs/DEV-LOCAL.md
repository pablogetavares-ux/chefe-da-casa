# Desenvolvimento local

## Comando único

```bash
npm run dev
```

(`yarn dev` faz o mesmo.)

- **Pasta no OneDrive:** sincroniza para `C:\dev\chef-da-casa` e sobe o servidor lá (rápido, sem aviso de disco lento).
- **Pasta em `C:\dev\chef-da-casa`:** sobe o Next.js direto na pasta.

## Outros

```bash
npm run dev:stop     # para a porta 3000
npm run sync:dev     # só copia código → C:\dev (sem subir servidor)
```

## Admin

http://localhost:3000/app/admin — e-mail em `ADMIN_EMAILS` no `.env`.

## Cursor (opcional)

Abrir `chef-da-casa-dev.code-workspace` aponta para `C:\dev\chef-da-casa`.
