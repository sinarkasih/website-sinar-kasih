// Lokasi file: app/kategori/[slug]/page.js
// Halaman kategori bertingkat:
// - Jika kategori masih punya anak  -> tampil kotak-kotak anak kategori
//   + tombol "Lihat semua produk ..." (gabungan semua turunannya).
// - Jika kategori paling bawah       -> tampil daftar produk.

import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabase } from "../../../lib/supabase";
import { ambilKatalog, GridProduk, PaginasiPublik } from "../../KatalogProduk";
import { PilihUrutan, KotakCari } from "../../KontrolKatalog";
import { buatPohon } from "../../KategoriPohon";

export const dynamic = "force-dynamic";

const PER_HALAMAN = 24;

export default async function KategoriDetailPage({ params, searchParams }) {
  const supabase = getSupabase();
  const { slug } = await params;
  const sp = await searchParams;
  // Produk di kategori diurutkan berdasarkan SKU secara bawaan
  const URUT_AWAL = "sku_az";
  const urut = sp?.urut || URUT_AWAL;
  const halaman = Math.max(1, Number(sp?.hal) || 1);
  const modeSemua = sp?.semua === "1";
  const q = (sp?.q || "").trim();

  if (!supabase) {
    return (
      <section className="section halaman-atas">
        <div className="wrap">
          <div className="notice">Koneksi database belum tersedia.</div>
        </div>
      </section>
    );
  }

  const { data: semuaKategori } = await supabase
    .from("kategori")
    .select("id, nama, slug, deskripsi, gambar_url, parent_id, urutan")
    .eq("aktif", true);

  const pohon = buatPohon(semuaKategori || []);
  const kategori = (semuaKategori || []).find((k) => k.slug === slug);

  if (!kategori) {
    notFound();
  }

  const anak = pohon.anak(kategori.id);
  const punyaAnak = anak.length > 0;
  const tampilProduk = !punyaAnak || modeSemua;
  const jalur = pohon.jalur(kategori.id);
  const induk = kategori.parent_id ? pohon.perId[kategori.parent_id] : null;
  const saudara = induk ? pohon.anak(induk.id) : [];

  let hasil = { produk: [], total: 0, error: null };
  if (tampilProduk) {
    hasil = await ambilKatalog(supabase, {
      kategoriIds: pohon.keturunan(kategori.id),
      cari: q,
      urut,
      halaman,
      perHalaman: PER_HALAMAN,
    });
  }

  function buatHref(n) {
    const p = new URLSearchParams();
    if (modeSemua) p.set("semua", "1");
    if (q) p.set("q", q);
    if (urut !== URUT_AWAL) p.set("urut", urut);
    if (n > 1) p.set("hal", String(n));
    const s = p.toString();
    return s ? `/kategori/${slug}?${s}` : `/kategori/${slug}`;
  }

  return (
    <section className="section halaman-atas">
      <div className="wrap">
        {/* Petunjuk posisi */}
        <nav className="jejak" aria-label="Posisi halaman">
          <Link href="/">Beranda</Link>
          <span>›</span>
          <Link href="/kategori">Kategori</Link>
          {jalur.map((k, i) => (
            <span key={k.id} className="jejak-item">
              <span>›</span>
              {i === jalur.length - 1 && !modeSemua ? (
                <strong>{k.nama}</strong>
              ) : (
                <Link href={`/kategori/${k.slug}`}>{k.nama}</Link>
              )}
            </span>
          ))}
          {modeSemua && (
            <span className="jejak-item">
              <span>›</span>
              <strong>Semua produk</strong>
            </span>
          )}
        </nav>

        <div className="kepala-kategori">
          <div className="kepala-halaman kepala-gambar">
            {kategori.gambar_url && (
              <div className="kepala-ikon">
                <img src={kategori.gambar_url} alt={kategori.nama} />
              </div>
            )}
            <div>
              <h1>{modeSemua ? `Semua produk ${kategori.nama}` : kategori.nama}</h1>
              <p>
                {modeSemua
                  ? `Semua produk dari setiap jenis ${kategori.nama}.`
                  : kategori.deskripsi ||
                    (punyaAnak
                      ? `Pilih jenis ${kategori.nama} yang Anda cari.`
                      : `Produk dalam kategori ${kategori.nama}.`)}
              </p>
            </div>
          </div>

          {punyaAnak && !modeSemua && (
            <Link href={`/kategori/${kategori.slug}?semua=1`} className="btn btn-garis tombol-semua">
              Lihat semua produk {kategori.nama} →
            </Link>
          )}
          {modeSemua && (
            <Link href={`/kategori/${kategori.slug}`} className="btn btn-garis tombol-semua">
              ← Pilih jenis {kategori.nama}
            </Link>
          )}
        </div>

        {/* Pindah cepat ke kategori saudara (di kategori paling bawah) */}
        {!punyaAnak && saudara.length > 1 && (
          <div className="chip-kategori">
            {saudara.map((s) => (
              <Link
                key={s.id}
                href={`/kategori/${s.slug}`}
                className={s.id === kategori.id ? "aktif" : ""}
              >
                {s.nama}
              </Link>
            ))}
          </div>
        )}

        {!tampilProduk ? (
          <div className="kat-grid kat-grid-anak">
            {anak.map((k) => {
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
                  {jumlahAnak > 0 && (
                    <span className="kat-sub">{jumlahAnak} jenis</span>
                  )}
                </Link>
              );
            })}
          </div>
        ) : hasil.error ? (
          <div className="notice">Produk gagal dimuat. Coba muat ulang halaman.</div>
        ) : (
          <>
            <Suspense fallback={null}>
              <div className="kk-baris">
                <KotakCari
                  awal={q}
                  tujuan={`/kategori/${kategori.slug}`}
                  placeholder={`Cari di ${kategori.nama}...`}
                />
                <PilihUrutan bawaan={URUT_AWAL} />
              </div>
            </Suspense>

            {hasil.produk.length === 0 ? (
              <div className="kosong-cantik">
                <h2>{q ? "Produk tidak ditemukan" : "Belum ada produk"}</h2>
                <p>
                  {q
                    ? `Tidak ada produk "${q}" di ${kategori.nama}. Coba kata lain atau cari di semua produk.`
                    : "Produk dalam kategori ini akan segera tersedia."}
                </p>
                {q ? (
                  <Link href={`/cari?q=${encodeURIComponent(q)}`} className="btn">Cari di Semua Produk</Link>
                ) : (
                  <Link href="/kategori" className="btn">Lihat Kategori Lain</Link>
                )}
              </div>
            ) : (
              <>
                <p className="jumlah-hasil">
                  {hasil.total} produk{q ? ` untuk "${q}"` : ""}
                </p>
                <GridProduk produk={hasil.produk} />
                <PaginasiPublik
                  halaman={halaman}
                  total={hasil.total}
                  perHalaman={PER_HALAMAN}
                  buatHref={buatHref}
                />
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}
