async function downscaleToWebP(file: File, maxW = 1280, quality = 0.65) {
  // Create an image from the file
  const img = document.createElement("img");
  img.src = URL.createObjectURL(file);
  await img.decode();

  // Calculate new size (keep aspect ratio)
  const scale = Math.min(1, maxW / img.naturalWidth);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);

  // Draw the image onto a canvas
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // Convert canvas → compressed WebP blob
  const blob = await new Promise<Blob | null>((r) =>
    canvas.toBlob(r, "image/webp", quality)
  );
  return new File([blob!], file.name.replace(/\.\w+$/, ".webp"), {
    type: "image/webp",
  });
}

export async function uploadScreenshot(file: File) {
  // 🧠 Step 1: shrink the image before upload
  const smallFile = await downscaleToWebP(file, 1280, 0.65);

  // 🧠 Step 2: request upload signature from backend
  const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
  const sig = await fetch(`${API}/api/trades/signature?folder=trades`).then(
    (r) => r.json()
  );

  // 🧠 Step 3: upload the compressed file to Cloudinary
  const form = new FormData();
  form.append("file", smallFile);
  form.append("api_key", sig.apiKey);
  form.append("timestamp", String(sig.timestamp));
  form.append("folder", sig.folder);
  form.append("signature", sig.signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
    {
      method: "POST",
      body: form,
    }
  );

  if (!res.ok) throw new Error("Cloudinary upload failed");
  return res.json(); // { secure_url, public_id, ... }
}
