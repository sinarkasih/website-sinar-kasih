// Lokasi file: lib/kompresGambar.js
// Mengecilkan foto di browser SEBELUM di-upload ke Supabase.
// Foto dari HP (3–8 MB) biasanya menjadi sekitar 150–400 KB tanpa terlihat buram.
// - Sisi terpanjang dibatasi (default 1600 px), arah foto HP ikut dibetulkan.
// - Disimpan sebagai WebP (latar transparan tetap aman, cocok untuk logo).
//   Jika browser tidak mendukung WebP, dipakai JPEG (atau PNG untuk logo transparan).
// - GIF, SVG, video, dan file non-gambar tidak diubah.
// - Jika hasilnya justru lebih besar, file asli yang dipakai.

const TIDAK_DIUBAH = ["image/gif", "image/svg+xml"];

function muatGambar(file) {
  if (typeof createImageBitmap === "function") {
    return createImageBitmap(file, { imageOrientation: "from-image" }).catch(() => muatLewatImg(file));
  }
  return muatLewatImg(file);
}

function muatLewatImg(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Gambar tidak dapat dibaca."));
    };
    img.src = url;
  });
}

function keBlob(canvas, tipe, kualitas) {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), tipe, kualitas));
}

export async function kompresGambar(file, { maks = 1600, kualitas = 0.82 } = {}) {
  try {
    if (!file || typeof window === "undefined") return file;
    if (!file.type || !file.type.startsWith("image/") || TIDAK_DIUBAH.includes(file.type)) return file;

    const gambar = await muatGambar(file);
    const lebarAsli = gambar.width;
    const tinggiAsli = gambar.height;
    if (!lebarAsli || !tinggiAsli) return file;

    const skala = Math.min(1, maks / Math.max(lebarAsli, tinggiAsli));
    // Sudah kecil (ukuran & berat): tidak perlu diubah
    if (skala === 1 && file.size <= 300 * 1024) return file;

    const lebar = Math.round(lebarAsli * skala);
    const tinggi = Math.round(tinggiAsli * skala);
    const canvas = document.createElement("canvas");
    canvas.width = lebar;
    canvas.height = tinggi;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(gambar, 0, 0, lebar, tinggi);
    if (typeof gambar.close === "function") gambar.close();

    let blob = await keBlob(canvas, "image/webp", kualitas);
    let ekstensi = "webp";

    if (!blob || blob.type !== "image/webp") {
      if (file.type === "image/png") {
        blob = await keBlob(canvas, "image/png");
        ekstensi = "png";
      } else {
        // JPEG tidak mendukung transparan: beri latar putih
        const latar = document.createElement("canvas");
        latar.width = lebar;
        latar.height = tinggi;
        const c2 = latar.getContext("2d");
        c2.fillStyle = "#ffffff";
        c2.fillRect(0, 0, lebar, tinggi);
        c2.drawImage(canvas, 0, 0);
        blob = await keBlob(latar, "image/jpeg", kualitas);
        ekstensi = "jpg";
      }
    }

    if (!blob || blob.size >= file.size) return file;

    const namaDasar = (file.name || "foto").replace(/\.[^.]+$/, "") || "foto";
    return new File([blob], `${namaDasar}.${ekstensi}`, { type: blob.type, lastModified: Date.now() });
  } catch (e) {
    console.warn("Foto tidak dikecilkan, memakai file asli:", e);
    return file;
  }
}
