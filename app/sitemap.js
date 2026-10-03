// Lokasi file: app/sitemap.js
// Daftar isi website untuk Google (sinarkasih.co.id/sitemap.xml):
// halaman utama, semua kategori, brand, dan produk aktif.
// Diperbarui otomatis setiap jam.

import { getSupabase } from "../lib/supabase";

const SITUS = "https://sinarkasih.co.id";

export const revalidate = 3600;

async function ambilSemua(supabase, buatQuery) {
  const hasil = [];
  for (let dari = 0; dari < 20000; dari += 1000) {
    const { data, error } = await buatQuery().range(dari, dari + 999);
    if (error || !data || data.length === 0) break;
    hasil.push(...data);
    if (data.length < 1000) break;
  }
  return hasil;
}

export default async function sitemap() {
  const sekarang = new Date();
  const halaman = [
    { url: `${SITUS}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITUS}/kategori`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITUS}/kategori?tab=brand`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITUS}/cari`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITUS}/toko`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITUS}/cara-pesan`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITUS}/tentang`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITUS}/info`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITUS}/loker`, changeFrequency: "weekly", priority: 0.4 },
    { url: `${SITUS}/kebijakan-privasi`, changeFrequency: "yearly", priority: 0.2 },
  ].map((h) => ({ ...h, lastModified: sekarang }));

  const supabase = getSupabase();
  if (!supabase) return halaman;

  try {
    const [kategori, brand, produk] = await Promise.all([
      ambilSemua(supabase, () =>
        supabase.from("kategori").select("slug").eq("aktif", true).order("id", { ascending: true })
      ),
      ambilSemua(supabase, () =>
        supabase.from("brand").select("slug").eq("aktif", true).order("id", { ascending: true })
      ),
      ambilSemua(supabase, () =>
        supabase
          .from("produk")
          .select("id")
          .eq("aktif", true)
          .is("deleted_at", null)
          .order("id", { ascending: true })
      ),
    ]);

    return [
      ...halaman,
      ...kategori
        .filter((k) => k.slug)
        .map((k) => ({
          url: `${SITUS}/kategori/${encodeURIComponent(k.slug)}`,
          lastModified: sekarang,
          changeFrequency: "weekly",
          priority: 0.8,
        })),
      ...brand
        .filter((b) => b.slug)
        .map((b) => ({
          url: `${SITUS}/cari?brand=${encodeURIComponent(b.slug)}`,
          lastModified: sekarang,
          changeFrequency: "weekly",
          priority: 0.6,
        })),
      ...produk.map((p) => ({
        url: `${SITUS}/produk/${p.id}`,
        lastModified: sekarang,
        changeFrequency: "weekly",
        priority: 0.7,
      })),
    ];
  } catch (e) {
    console.error("SITEMAP ERROR:", e);
    return halaman;
  }
}
