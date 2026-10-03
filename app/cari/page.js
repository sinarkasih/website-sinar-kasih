// Lokasi file: app/cari/page.js
// Halaman Cari Produk: pencarian, urutan, halaman 1 2 3,
// dan daftar produk per brand (/cari?brand=slug-brand).

import { Suspense } from "react";
import Link from "next/link";
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
  const slugBrandAwal = (params?.brand || "").trim();
  // Daftar produk per brand diurutkan berdasarkan SKU secara bawaan
  const URUT_AWAL = slugBrandAwal ? "sku_az" : "terbaru";
  const urut = params?.urut || URUT_AWAL;
  const halaman = Math.max(1, Number(params?.hal) || 1);

  const slugBrand = (params?.brand || "").trim();

  const supabase = getSupabase();

  // Jika dibuka dari kartu brand: tampilkan produk brand tersebut
  let brand = null;
  if (supabase && slugBrand) {
    const { data } = await supabase
      .from("brand")
      .select("id, nama, slug, logo_url")
      .eq("slug", slugBrand)
      .eq("aktif", true)
      .maybeSingle();
    brand = data || null;
  }

  const { produk, total, error } = supabase
    ? await ambilKatalog(supabase, {
        cari: q,
        brandId: brand?.id,
        urut,
        halaman,
        perHalaman: PER_HALAMAN,
      })
    : { produk: [], total: 0, error: "Koneksi database belum tersedia." };

  function buatHref(n) {
    const p = new URLSearchParams();
    if (brand) p.set("brand", brand.slug);
    if (q) p.set("q", q);
    if (urut !== URUT_AWAL) p.set("urut", urut);
    if (n > 1) p.set("hal", String(n));
    const s = p.toString();
    return s ? `/cari?${s}` : "/cari";
  }

  return (
    <section className="section halaman-atas">
      <div className="wrap">
        {brand ? (
          <>
            <nav className="jejak" aria-label="Posisi halaman">
              <a href="/">Beranda</a>
              <span>›</span>
              <Link href="/kategori?tab=brand">Brand</Link>
              <span>›</span>
              <strong>{brand.nama}</strong>
            </nav>
            <div className="kepala-halaman kepala-gambar">
              {brand.logo_url && (
                <div className="kepala-ikon">
                  <img src={brand.logo_url} alt={brand.nama} />
                </div>
              )}
              <div>
                <h1>Produk {brand.nama}</h1>
                <p>Semua produk dari brand {brand.nama} yang tersedia di Sinar Kasih.</p>
              </div>
            </div>
          </>
        ) : (
          <>
          <nav className="jejak" aria-label="Posisi halaman">
            <a href="/">Beranda</a>
            <span>›</span>
            <strong>Cari Produk</strong>
          </nav>
          <div className="kepala-halaman">
            <h1>Cari Produk</h1>
            <p>
              {q
                ? `Hasil pencarian untuk "${q}"`
                : "Temukan produk berdasarkan nama atau kode SKU."}
            </p>
          </div>
          </>
        )}

        <Suspense fallback={null}>
          <div className="kk-baris">
            <KotakCari awal={q} />
            <PilihUrutan bawaan={URUT_AWAL} />
          </div>
        </Suspense>

        {error ? (
          <div className="notice">Produk gagal dimuat. Coba muat ulang halaman.</div>
        ) : produk.length === 0 ? (
          <div className="kosong-cantik">
            <h2>Produk tidak ditemukan</h2>
            <p>
              {brand
                ? `Belum ada produk ${brand.nama} yang ditampilkan.`
                : "Coba kata kunci lain, atau lihat produk berdasarkan kategori."}
            </p>
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
