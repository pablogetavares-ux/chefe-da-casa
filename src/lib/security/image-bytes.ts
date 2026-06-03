const MAX_BYTES = 5 * 1024 * 1024;

const SIGNATURES: Record<string, number[]> = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47],
  "image/webp": [0x52, 0x49, 0x46, 0x46],
};

function matchesHeic(bytes: Uint8Array) {
  if (bytes.length < 12) return false;
  const brand = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
  return ["heic", "heix", "hevc", "mif1", "msf1"].includes(brand);
}

export function assertImageMagicBytes(buffer: ArrayBuffer, mimeType: string) {
  if (buffer.byteLength > MAX_BYTES) throw new Error("IMAGE_TOO_LARGE");
  const bytes = new Uint8Array(buffer);
  if (bytes.length < 4) throw new Error("INVALID_IMAGE_TYPE");

  if (mimeType === "image/heic" || mimeType === "image/heif") {
    if (!matchesHeic(bytes)) throw new Error("INVALID_IMAGE_TYPE");
    return;
  }

  const sig = SIGNATURES[mimeType];
  if (!sig || !sig.every((byte, i) => bytes[i] === byte)) {
    throw new Error("INVALID_IMAGE_TYPE");
  }
}

export const MAX_IMAGE_BYTES = MAX_BYTES;
export const MAX_BASE64_LENGTH = Math.ceil((MAX_BYTES * 4) / 3) + 64;
