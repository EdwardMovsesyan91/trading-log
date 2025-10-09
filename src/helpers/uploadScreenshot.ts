import { API_BASE_URL } from "../api/config";

/** Cloudinary response (subset) */
export type CloudinaryUploadResponse = {
  secure_url: string;
  public_id: string;
  version?: number;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
  [k: string]: any;
};

export type UploadOptions = {
  /** Cloudinary folder (defaults to "trades") */
  folder?: string;
  /** If provided, upload will target this public_id (enables overwrite flow on update) */
  publicId?: string;
  /** When publicId is provided, set true to overwrite */
  overwrite?: boolean;
  /** When publicId is provided, set true to invalidate CDN cache */
  invalidate?: boolean;
  /** Client-side resize width (default 1280) */
  maxW?: number;
  /** WebP quality (0–1, default 0.65) */
  quality?: number;
};

async function downscaleToWebP(file: File, maxW = 1280, quality = 0.65) {
  const img = document.createElement("img");
  const objUrl = URL.createObjectURL(file);
  img.src = objUrl;
  try {
    await img.decode();
  } catch {
    // Fallback for Safari/older if decode fails
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Image decode failed"));
    });
  }

  const scale = Math.min(1, maxW / img.naturalWidth);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);

  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>((r) =>
    canvas.toBlob(r, "image/webp", quality)
  );
  URL.revokeObjectURL(objUrl);
  if (!blob) throw new Error("Failed to encode WebP");

  return new File([blob], file.name.replace(/\.\w+$/, ".webp"), {
    type: "image/webp",
  });
}

/**
 * Upload (or overwrite) a screenshot to Cloudinary.
 * - On **create**: call with just the File (uses default folder).
 * - On **update**: pass { publicId: `trades/${tradeId}`, overwrite: true, invalidate: true } to replace the old image.
 *
 * Returns `{ raw, secureUrl, publicId }`.
 */
export async function uploadScreenshot(
  file: File,
  opts: UploadOptions = {}
): Promise<{
  raw: CloudinaryUploadResponse;
  secureUrl: string;
  publicId: string;
}> {
  const {
    folder = "trades",
    publicId,
    overwrite = false,
    invalidate = false,
    maxW = 1280,
    quality = 0.65,
  } = opts;

  // 1) Shrink image client-side (keeps UI fast, saves bandwidth)
  const smallFile = await downscaleToWebP(file, maxW, quality);

  // 2) Ask backend for a signed upload (include overwrite params if provided)
  const API = API_BASE_URL || "http://localhost:4000";
  const qs = new URLSearchParams({ folder });
  if (publicId) qs.set("public_id", publicId);
  if (overwrite) qs.set("overwrite", "1");
  if (invalidate) qs.set("invalidate", "1");

  const sigRes = await fetch(`${API}/api/trades/signature?${qs.toString()}`);
  if (!sigRes.ok) throw new Error("Failed to get Cloudinary signature");
  const sig = await sigRes.json();

  // 3) Upload to Cloudinary
  const form = new FormData();
  form.append("file", smallFile);
  form.append("api_key", sig.apiKey);
  form.append("timestamp", String(sig.timestamp));
  form.append("folder", sig.folder);
  form.append("signature", sig.signature);

  // Include overwrite params only when provided/signed
  if (sig.public_id) form.append("public_id", sig.public_id);
  if (sig.overwrite) form.append("overwrite", String(sig.overwrite));
  if (sig.invalidate) form.append("invalidate", String(sig.invalidate));

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
    { method: "POST", body: form }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || "Cloudinary upload failed");
  }

  const raw: CloudinaryUploadResponse = await res.json();
  return {
    raw,
    secureUrl: raw.secure_url,
    publicId: raw.public_id,
  };
}
