import { afterEach, describe, expect, it } from "vitest";

import {
  getStorageOfferImageUrl,
  matchOfferImageKey,
  resolveOfferImageSrc,
  resolveOfferImageUrl,
} from "@/modules/offers/constants/offer-images";

const SUPABASE_BASE = "https://mnevlegpkrncxlqkqdnl.supabase.co";

describe("offer images", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  });

  it("resolve tomate", () => {
    expect(resolveOfferImageUrl("Tomate salada", ["tomate"])).toBe(
      "/offers/tomate.svg",
    );
  });

  it("resolve ovo", () => {
    expect(resolveOfferImageUrl("Ovos brancos", ["ovo", "ovos"])).toBe(
      "/offers/ovos.svg",
    );
  });

  it("match por título da oferta", () => {
    expect(
      matchOfferImageKey(
        "Folhas verdes",
        ["alface", "rucula", "folhas"],
        "",
        "Folhas verdes mix",
      ),
    ).toBe("folhas");
    expect(
      matchOfferImageKey(
        "Iogurte natural",
        ["iogurte"],
        "",
        "Iogurte natural 900g",
      ),
    ).toBe("iogurte");
  });

  it("prioriza foto real do Supabase Storage quando o arquivo corresponde ao produto", () => {
    const url = `${SUPABASE_BASE}/storage/v1/object/public/offer-images/tomate-vermelho.jpg`;
    expect(resolveOfferImageSrc(url, "Tomate", ["tomate"], "", "Tomate")).toBe(
      url,
    );
  });

  it("substitui SVG no banco por foto real quando o produto é reconhecido", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = SUPABASE_BASE;
    expect(
      resolveOfferImageSrc(
        "/offers/iogurte.svg",
        "Iogurte natural",
        ["iogurte"],
        "",
        "Iogurte natural 900g",
      ),
    ).toBe(
      `${SUPABASE_BASE}/storage/v1/object/public/offer-images/iogurte-natural.jpg`,
    );
    expect(
      resolveOfferImageSrc(
        "/offers/folhas.svg",
        "Folhas verdes",
        ["alface", "rucula", "folhas"],
        "",
        "Folhas verdes mix",
      ),
    ).toContain("folhas.jpg");
    expect(
      resolveOfferImageSrc(
        "/offers/tomate.svg",
        "Tomate italiano",
        ["tomate"],
        "",
        "Tomate italiano",
      ),
    ).toContain("tomate-vermelho.jpg");
  });

  it("ignora arroz.jpg legado (arroz frito) e usa Storage ou SVG", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = SUPABASE_BASE;
    const legacyFriedRice = `${SUPABASE_BASE}/storage/v1/object/public/offer-images/arroz.jpg?v=1`;
    expect(
      resolveOfferImageSrc(
        legacyFriedRice,
        "Arroz branco 5kg",
        ["arroz"],
        "Tipo 1 — promoção da semana",
        "Arroz tipo 1 5kg",
      ),
    ).toContain("arroz-pacote.jpg");
  });

  it("aceita arroz-pacote.jpg no Storage", () => {
    const url = `${SUPABASE_BASE}/storage/v1/object/public/offer-images/arroz-pacote.jpg?v=2`;
    expect(
      resolveOfferImageSrc(url, "Arroz branco 5kg", ["arroz"], "", "Arroz"),
    ).toBe(url);
  });

  it("mantém svg local quando não há Storage configurado", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    expect(
      resolveOfferImageSrc("/offers/iogurte.svg", "Iogurte", [], "", "Iogurte"),
    ).toBe("/offers/iogurte.svg");
  });

  it("tomate vence salada na descrição", () => {
    expect(
      resolveOfferImageUrl(
        "Tomate italiano",
        ["tomate", "tomate italiano"],
        "Bandeja 500g — molhos e saladas",
        "Tomate italiano",
      ),
    ).toBe("/offers/tomate.svg");
  });

  it("getStorageOfferImageUrl retorna null sem env", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    expect(getStorageOfferImageUrl("tomate")).toBeNull();
  });

  it("fallback folhas", () => {
    expect(resolveOfferImageUrl("Produto genérico", [])).toBe(
      "/offers/folhas.svg",
    );
  });
});
