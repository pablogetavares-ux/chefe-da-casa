/**
 * Sincroniza fotos realistas para Supabase Storage e atualiza regional_offers.
 *
 * Fonte: arquivos locais em scripts/offer-photo-assets/ (validados visualmente).
 * Não usa IDs Pexels na URL — o CDN não garante correspondência foto/produto.
 *
 * Uso: npm run offers:sync-images
 */
import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = path.join(__dirname, "offer-photo-assets");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = "offer-images";

/** @type {Record<string, { file: string; label: string; match: string[] }>} */
const OFFER_PHOTOS = {
  tomate: {
    file: "tomate-vermelho.jpg",
    label: "Tomates vermelhos",
    match: ["tomate"],
  },
  ovos: {
    file: "ovos-cartela.jpg",
    label: "Ovos",
    match: ["ovo", "ovos"],
  },
  azeite: {
    file: "azeite.jpg",
    label: "Azeite de oliva",
    match: ["azeite"],
  },
  iogurte: {
    file: "iogurte-natural.jpg",
    label: "Iogurte com frutas",
    match: ["iogurte"],
  },
  frango: {
    file: "frango.jpg",
    label: "Frango",
    match: ["frango", "filé", "file"],
  },
  arroz: {
    file: "arroz-pacote.jpg",
    label: "Arroz em pacote / saco",
    match: ["arroz"],
  },
  salmao: {
    file: "salmao.jpg",
    label: "Salmão",
    match: ["salm", "salmao", "salmão"],
  },
  folhas: {
    file: "folhas.jpg",
    label: "Salada verde",
    match: ["folha", "mix", "alface", "salada", "rúcula", "rucula"],
  },
};

function publicUrl(file, version) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${file}?v=${version}`;
}

function termMatches(haystack, term) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|[\\s,.\\-/])${escaped}(?:$|[\\s,.\\-/])`, "i").test(
    ` ${haystack} `,
  );
}

function resolvePhotoKey(productName, title, description = "") {
  const haystack = `${productName} ${title} ${description}`.toLowerCase();

  const priority = [
    "tomate",
    "ovos",
    "azeite",
    "iogurte",
    "frango",
    "arroz",
    "salmao",
    "folhas",
  ];

  for (const key of priority) {
    const photo = OFFER_PHOTOS[key];
    if (photo.match.some((term) => termMatches(haystack, term))) return key;
  }

  return "folhas";
}

async function main() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error(
      "Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY",
    );
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const version = Math.floor(Date.now() / 1000);
  console.log("→ Upload de assets locais para offer-images...");

  const uploaded = new Map();

  for (const [key, photo] of Object.entries(OFFER_PHOTOS)) {
    const localPath = path.join(ASSETS_DIR, photo.file);
    const buffer = await readFile(localPath);

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(photo.file, buffer, {
        contentType: "image/jpeg",
        upsert: true,
        cacheControl: "3600",
      });

    if (error) throw new Error(`Upload ${key}: ${error.message}`);

    uploaded.set(key, publicUrl(photo.file, version));
    console.log(`  ✓ ${key} (${photo.label}) → ${photo.file}`);
  }

  const { data: offers, error: listError } = await supabase
    .from("regional_offers")
    .select("id, title, product_name, description");

  if (listError) throw listError;

  console.log("→ Atualizando regional_offers...");
  for (const offer of offers ?? []) {
    const key = resolvePhotoKey(
      offer.product_name,
      offer.title,
      offer.description ?? "",
    );
    const imageUrl = uploaded.get(key) ?? uploaded.get("folhas");

    const { error } = await supabase
      .from("regional_offers")
      .update({ image_url: imageUrl })
      .eq("id", offer.id);

    if (error) throw error;
    console.log(`  ✓ ${offer.title} → ${key}`);
  }

  console.log("\n✓ Fotos realistas sincronizadas (assets locais verificados).");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
