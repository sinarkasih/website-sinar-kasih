import { createClient } from "@supabase/supabase-js";

// Lokasi file: lib/supabase.js
// Di browser hanya dibuat SATU koneksi Supabase lalu dipakai bersama,
// supaya status login (masuk/keluar) selalu sama di semua halaman.

let klienBrowser = null;

export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  // Di server: buat baru setiap kali (tidak menyimpan sesi)
  if (typeof window === "undefined") {
    return createClient(url, key);
  }

  // Di browser: pakai koneksi yang sama
  if (!klienBrowser) {
    klienBrowser = createClient(url, key);
  }

  return klienBrowser;
}
