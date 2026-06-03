/** Fallback SVG em /public/offers quando não há foto no Storage. */
export const OFFER_IMAGE_BY_KEYWORD: Record<string, string> = {
  tomate: "/offers/tomate.svg",
  ovo: "/offers/ovos.svg",
  ovos: "/offers/ovos.svg",
  azeite: "/offers/azeite.svg",
  iogurte: "/offers/iogurte.svg",
  frango: "/offers/frango.svg",
  filé: "/offers/frango.svg",
  file: "/offers/frango.svg",
  arroz: "/offers/arroz.svg",
  salmão: "/offers/salmao.svg",
  salmao: "/offers/salmao.svg",
  folhas: "/offers/folhas.svg",
  alface: "/offers/folhas.svg",
  salada: "/offers/folhas.svg",
};

export const DEFAULT_OFFER_IMAGE = "/offers/folhas.svg";
export const OFFER_IMAGES_BUCKET = "offer-images";

/** Arquivo no bucket Supabase para cada chave (sync-offer-images). */
export const STORAGE_FILE_BY_KEY: Partial<Record<string, string>> = {
  tomate: "tomate-vermelho.jpg",
  ovos: "ovos-cartela.jpg",
  ovo: "ovos-cartela.jpg",
  azeite: "azeite.jpg",
  iogurte: "iogurte-natural.jpg",
  frango: "frango.jpg",
  filé: "frango.jpg",
  file: "frango.jpg",
  arroz: "arroz-pacote.jpg",
  salmão: "salmao.jpg",
  salmao: "salmao.jpg",
  folhas: "folhas.jpg",
  alface: "folhas.jpg",
  salada: "folhas.jpg",
};

export function isSupabaseOfferImage(url: string | null | undefined): boolean {
  return Boolean(url?.includes("/storage/v1/object/public/offer-images/"));
}

export function isLocalOfferImage(url: string | null | undefined): boolean {
  return Boolean(url?.startsWith("/offers/"));
}

/** Ordem fixa: termos de produto antes de genéricos como "salada". */
const OFFER_IMAGE_MATCH_ORDER = [
  "tomate",
  "ovos",
  "ovo",
  "azeite",
  "iogurte",
  "frango",
  "filé",
  "file",
  "arroz",
  "salmão",
  "salmao",
  "folhas",
  "alface",
  "salada",
] as const;

function termMatchesHaystack(haystack: string, term: string) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|[\\s,.\\-/])${escaped}(?:$|[\\s,.\\-/])`, "i").test(
    ` ${haystack} `,
  );
}

function buildOfferHaystack(
  productName: string,
  keywords: string[],
  description: string,
  title: string,
) {
  return [title, productName, description, ...keywords].join(" ").toLowerCase();
}

/** Chave do produto reconhecida (ex.: arroz, tomate) ou null. */
export function matchOfferImageKey(
  productName: string,
  keywords: string[] = [],
  description = "",
  title = "",
): string | null {
  const haystack = buildOfferHaystack(
    productName,
    keywords,
    description,
    title,
  );

  for (const key of OFFER_IMAGE_MATCH_ORDER) {
    if (termMatchesHaystack(haystack, key)) return key;
  }

  return null;
}

export function resolveOfferImageUrl(
  productName: string,
  keywords: string[] = [],
  description = "",
  title = "",
): string {
  const key = matchOfferImageKey(productName, keywords, description, title);
  if (key) return OFFER_IMAGE_BY_KEYWORD[key];
  return DEFAULT_OFFER_IMAGE;
}

/** URL pública da foto realista no Supabase Storage (quando configurado). */
export function getStorageOfferImageUrl(key: string): string | null {
  const file = STORAGE_FILE_BY_KEY[key];
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!file || !base) return null;
  return `${base}/storage/v1/object/public/${OFFER_IMAGES_BUCKET}/${file}`;
}

/** JPEG antigo no CDN (arroz frito no prato) — ignorar para forçar foto nova ou SVG. */
function isLegacyBadOfferImage(url: string | null | undefined): boolean {
  return Boolean(url?.includes("/offer-images/arroz.jpg"));
}

function storageUrlMatchesKey(url: string, key: string): boolean {
  const expectedFile = STORAGE_FILE_BY_KEY[key];
  return Boolean(expectedFile && url.includes(expectedFile));
}

/**
 * Prioridade: foto real no Storage (por título/produto) → Storage no banco → SVG.
 * SVG no banco não bloqueia foto real quando o produto é reconhecido.
 */
export function resolveOfferImageSrc(
  imageUrl: string | null | undefined,
  productName: string,
  keywords: string[] = [],
  description = "",
  title = "",
): string {
  const safeImageUrl = isLegacyBadOfferImage(imageUrl) ? null : imageUrl;
  const matchedKey = matchOfferImageKey(
    productName,
    keywords,
    description,
    title,
  );
  const storageFromKey = matchedKey
    ? getStorageOfferImageUrl(matchedKey)
    : null;

  if (matchedKey && storageFromKey) {
    if (
      isSupabaseOfferImage(safeImageUrl) &&
      storageUrlMatchesKey(safeImageUrl!, matchedKey)
    ) {
      return safeImageUrl!;
    }
    return storageFromKey;
  }

  if (isSupabaseOfferImage(safeImageUrl)) {
    return safeImageUrl!;
  }

  if (isLocalOfferImage(safeImageUrl)) {
    return safeImageUrl!;
  }

  return resolveOfferImageUrl(productName, keywords, description, title);
}

export function shouldUnoptimizeOfferImage(src: string): boolean {
  return src.endsWith(".svg");
}
