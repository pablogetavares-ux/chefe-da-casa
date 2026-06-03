# Imagens realistas das ofertas

## Fluxo

1. **Assets locais** — `scripts/offer-photo-assets/*.jpg` (fotos validadas por produto).
2. **Storage** — bucket Supabase `offer-images` (upload via `npm run offers:sync-images`).
3. **Banco** — `regional_offers.image_url` atualizado pelo script com URL pública do Storage.
4. **Backend** — `mapOfferRow` em `offers.ts` chama `resolveOfferImageSrc(title, product_name, keywords…)`.
5. **Frontend** — `OfferCard` usa a mesma resolução + fallback se a imagem falhar ao carregar.

## Regra de correspondência

Ordem em `matchOfferImageKey` (título + nome do produto + descrição + keywords):

`tomate` → `ovos` → `azeite` → `iogurte` → `frango` → `arroz` → `salmão` → `folhas` / `alface` / `salada`

**Prioridade de exibição** (`resolveOfferImageSrc`):

1. Foto real no Storage quando o produto é reconhecido (mesmo que o banco ainda tenha `.svg`).
2. URL do Storage já gravada no banco (se o arquivo bate com o produto).
3. SVG em `/public/offers/`.

## Comandos

```bash
npm run offers:sync-images   # upload + atualiza todas as ofertas no Supabase
npm test -- src/modules/offers/constants/offer-images.test.ts
```

## Novos produtos

1. Adicionar JPEG em `scripts/offer-photo-assets/`.
2. Registrar em `OFFER_PHOTOS` (`sync-offer-images.mjs`) e em `STORAGE_FILE_BY_KEY` / `OFFER_IMAGE_BY_KEYWORD` (`offer-images.ts`).
3. Rodar `npm run offers:sync-images`.
