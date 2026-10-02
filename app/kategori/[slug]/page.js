// Lokasi file: app/kategori/[slug]/page.js
// Daftar produk dalam satu kategori, dengan urutan dan halaman 1 2 3.

import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabase } from "../../../lib/supabase";
import {
  ambilKatalog,
  GridProduk,
  PaginasiPublik,
} from "../../KatalogProduk";
import { PilihUrutan } from "../../KontrolKatalog";

export const dynamic = "force-dynamic";

const PER_HALAMAN = 24;

export default async function KategoriDetailPage({ params, searchParams }) {
  const supabase = getSupabase();
  const { slug } = await params;
  const sp = await searchParams;
  const urut = sp?.urut || "terbaru";
  const halaman = Math.max(1, Number(sp?.hal) || 1);

  if (!supabase) {
    return (
      <section className="section halaman-atas">
        <div className="wrap">
          <div className="notice">Koneksi database belum tersedia.</div>
        </div>
      </section>
    );
  }

  const { data: kategori } = await supabase
    .from("kategori")
    .select("id, nama, slug, deskripsi, gambar_url")
    .eq("slug", slug)
    .eq("aktif", true)
    .maybeSingle();

  if (!kategori) {
    notFound();
  }

  const { produk, total, error } = await ambilKatalog(supabase, {
    kategoriId: kategori.id,
    urut,
    halaman,
    perHalaman: PER_HALAMAN,
  });

  function buatHref(n) {
    const p = new URLSearchParams();
    if (urut !== "terbaru") p.set("urut", urut);
    if (n > 1) p.set("hal", String(n));
    const s = p.toString();
    return s ? `/kategori/${slug}?${s}` : `/kategori/${slug}`;
  }

  return (
    <section className="section halaman-atas">
      <div className="wrap">
        <Link href="/kategori" className="tautan-kembali">
          ← Semua Kategori
        </Link>

        <div className="kepala-halaman kepala-gambar">
          {kategori.gambar_url && (
            <div className="kepala-ikon">
              <img src={kategori.gambar_url} alt={kategori.nama} />
            </div>
          )}
          <div>
            <h1>{kategori.nama}</h1>
            <p>{kategori.deskripsi || `Produk dalam kategori ${kategori.nama}.`}</p>
          </div>
        </div>

        {error ? (
          <div className="notice">Produk gagal dimuat. Coba muat ulang halaman.</div>
        ) : produk.length === 0 ? (
          <div className="kosong-cantik">
            <h2>Belum ada produk</h2>
            <p>Produk dalam kategori ini akan segera tersedia.</p>
            <Link href="/kategori" className="btn">Lihat Kategori Lain</Link>
          </div>
        ) : (
          <>
            <div className="kk-baris">
              <p className="jumlah-hasil">{total} produk</p>
              <Suspense fallback={null}>
                <PilihUrutan />
              </Suspense>
            </div>
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
