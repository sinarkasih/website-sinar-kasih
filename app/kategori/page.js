// Lokasi file: app/kategori/page.js
// Kategori utama: judul & jejak seragam, tab Kategori / Brand,
// hanya kategori paling atas (anak kategori dibuka di halaman kategorinya),
// dan kartu brand yang membuka daftar produk brand tersebut.

import Link from "next/link";
import { getSupabase } from "../../lib/supabase";
import { buatPohon } from "../KategoriPohon";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kategori Produk | Sinar Kasih",
  description: "Jelajahi produk listrik dan penerangan Sinar Kasih berdasarkan kategori atau brand.",
};

export default async function Page({ searchParams }) {
  const params = await searchParams;
  const tab = params?.tab === "brand" ? "brand" : "kategori";
  const supabase = getSupabase();

  let kategori = [];
  let brand = [];
  let gagal = null;

  if (!supabase) {
    gagal = "Koneksi database belum tersedia.";
  } else {
    const [k, b] = await Promise.all([
      supabase
        .from("kategori")
        .select("id, nama, slug, deskripsi, parent_id, urutan, gambar_url")
        .eq("aktif", true)
        .order("urutan", { ascending: true })
        .order("nama", { ascending: true }),
      supabase
        .from("brand")
        .select("id, nama, slug, logo_url, urutan")
        .eq("aktif", true)
        .order("urutan", { ascending: true })
        .order("nama", { ascending: true }),
    ]);
    if (k.error) {
      console.error("KATEGORI ERROR:", k.error);
      gagal = "Kategori gagal dimuat. Coba muat ulang halaman.";
    }
    if (b.error) {
      console.error("BRAND ERROR:", b.error);
      if (!gagal) gagal = "Brand gagal dimuat. Coba muat ulang halaman.";
    }
    kategori = k.data || [];
    brand = b.data || [];
  }

  const pohon = buatPohon(kategori);
  const utama = pohon.anak(null);

  return (
    <section className="section halaman-atas">
      <div className="wrap">
        <nav className="jejak" aria-label="Posisi halaman">
          <Link href="/">Beranda</Link>
          <span>›</span>
          {tab === "brand" ? (
            <>
              <Link href="/kategori">Kategori</Link>
              <span>›</span>
              <strong>Brand</strong>
            </>
          ) : (
            <strong>Kategori</strong>
          )}
        </nav>

        <div className="kepala-halaman">
          <h1>{tab === "brand" ? "Brand Produk" : "Kategori Produk"}</h1>
          <p>
            {tab === "brand"
              ? "Pilih brand untuk melihat semua produknya."
              : "Pilih kategori untuk melihat jenis dan produknya."}
          </p>
        </div>

        <div className="kt-tab" role="tablist" aria-label="Jelajahi berdasarkan">
          <Link
            href="/kategori"
            role="tab"
            aria-selected={tab === "kategori"}
            className={tab === "kategori" ? "aktif" : ""}
          >
            Kategori
            <span>{utama.length}</span>
          </Link>
          <Link
            href="/kategori?tab=brand"
            role="tab"
            aria-selected={tab === "brand"}
            className={tab === "brand" ? "aktif" : ""}
          >
            Brand
            <span>{brand.length}</span>
          </Link>
        </div>

        {gagal ? (
          <div className="notice">{gagal}</div>
        ) : tab === "brand" ? (
          brand.length === 0 ? (
            <div className="kosong-cantik">
              <h2>Belum ada brand</h2>
              <p>Brand produk akan segera ditampilkan.</p>
            </div>
          ) : (
            <div className="brand-grid kt-brand">
              {brand.map((b) => (
                <Link
                  key={b.id}
                  id={`brand-${b.slug}`}
                  href={`/cari?brand=${encodeURIComponent(b.slug)}`}
                  className="brand-kartu"
                  title={`Produk ${b.nama}`}
                >
                  {b.logo_url ? <img src={b.logo_url} alt={b.nama} loading="lazy" /> : <span>{b.nama}</span>}
                </Link>
              ))}
            </div>
          )
        ) : utama.length === 0 ? (
          <div className="kosong-cantik">
            <h2>Belum ada kategori</h2>
            <p>Kategori produk akan segera ditampilkan.</p>
          </div>
        ) : (
          <div className="kat-grid kat-grid-anak">
            {utama.map((k) => {
              const jumlahAnak = pohon.anak(k.id).length;
              return (
                <Link key={k.id} href={`/kategori/${k.slug}`} className="kat-kartu">
                  <div className="kat-foto">
                    {k.gambar_url ? (
                      <img src={k.gambar_url} alt={k.nama} loading="lazy" />
                    ) : (
                      <span>{k.nama.charAt(0)}</span>
                    )}
                  </div>
                  <span className="kat-nama">{k.nama}</span>
                  {jumlahAnak > 0 && <span className="kat-sub">{jumlahAnak} jenis</span>}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .kt-tab { display: inline-flex; gap: 4px; margin-bottom: 24px; padding: 4px; border: 1px solid #eadfce; border-radius: 14px; background: #fff; }
        .kt-tab a { display: inline-flex; align-items: center; gap: 8px; min-height: 42px; padding: 0 18px; border-radius: 10px; color: #6f5a49; font-size: 15px; font-weight: 700; text-decoration: none; }
        .kt-tab a:hover { background: #f8f1e8; }
        .kt-tab a.aktif { background: #6f4c36; color: #fff; }
        .kt-tab a span { min-width: 24px; height: 22px; padding: 0 7px; display: grid; place-items: center; border-radius: 999px; background: rgba(111, 76, 54, .1); font-size: 12px; box-sizing: border-box; }
        .kt-tab a.aktif span { background: rgba(255, 255, 255, .2); }
        .kt-brand .brand-kartu:target { border-color: #6f4c36; box-shadow: 0 0 0 3px rgba(111, 76, 54, .15); }
      `}</style>
    </section>
  );
}
