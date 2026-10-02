// Lokasi file: app/cari/page.js
// Halaman Cari Produk: pencarian, urutan, dan halaman 1 2 3.

import { Suspense } from "react";
import { getSupabase } from "../../lib/supabase";
import {
  ambilKatalog,
  GridProduk,
  PaginasiPublik,
} from "../KatalogProduk";
import { KotakCari, PilihUrutan } from "../KontrolKatalog";

export const dynamic = "force-dynamic";

const PER_HALAMAN = 24;

export default async function Page({ searchParams }) {
  const params = await searchParams;
  const q = (params?.q || "").trim();
  const urut = params?.urut || "terbaru";
  const halaman = Math.max(1, Number(params?.hal) || 1);

  const supabase = getSupabase();
  const { produk, total, error } = supabase
    ? await ambilKatalog(supabase, { cari: q, urut, halaman, perHalaman: PER_HALAMAN })
    : { produk: [], total: 0, error: "Koneksi database belum tersedia." };

  function buatHref(n) {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (urut !== "terbaru") p.set("urut", urut);
    if (n > 1) p.set("hal", String(n));
    const s = p.toString();
    return s ? `/cari?${s}` : "/cari";
  }

  return (
    <section className="section halaman-atas">
      <div className="wrap">
        <div className="kepala-halaman">
          <h1>Cari Produk</h1>
          <p>
            {q
              ? `Hasil pencarian untuk "${q}"`
              : "Temukan produk berdasarkan nama atau kode SKU."}
          </p>
        </div>

        <Suspense fallback={null}>
          <div className="kk-baris">
            <KotakCari awal={q} />
            <PilihUrutan />
          </div>
        </Suspense>

        {error ? (
          <div className="notice">Produk gagal dimuat. Coba muat ulang halaman.</div>
        ) : produk.length === 0 ? (
          <div className="kosong-cantik">
            <h2>Produk tidak ditemukan</h2>
            <p>Coba kata kunci lain, atau lihat produk berdasarkan kategori.</p>
            <a href="/kategori" className="btn">Lihat Kategori</a>
          </div>
        ) : (
          <>
            <p className="jumlah-hasil">{total} produk</p>
            <GridProduk produk={produk} />
            <PaginasiPublik
              halaman={halaman}
              total={total}
              perHalaman={PER_HALAMAN}
              buatHref={buatHref}
            />
          </>
        )}
      </div>
    </section>
  );
}
