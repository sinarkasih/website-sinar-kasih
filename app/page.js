// Lokasi file: app/page.js
// Beranda website Toko Listrik Sinar Kasih.

import { Suspense } from "react";
import Link from "next/link";
import { getSupabase } from "../lib/supabase";
import { ambilKatalog, GridProduk } from "./KatalogProduk";
import { KotakCari } from "./KontrolKatalog";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = getSupabase();

  let kategori = [];
  let brand = [];
  let produk = [];

  if (supabase) {
    const [hasilKategori, hasilBrand, hasilProduk] = await Promise.all([
      supabase
        .from("kategori")
        .select("id, nama, slug, gambar_url, urutan")
        .eq("aktif", true)
        .is("parent_id", null)
        .order("urutan", { ascending: true })
        .order("nama", { ascending: true })
        .limit(6),
      supabase
        .from("brand")
        .select("id, nama, slug, logo_url, urutan")
        .eq("aktif", true)
        .order("urutan", { ascending: true })
        .order("nama", { ascending: true })
        .limit(12),
      ambilKatalog(supabase, { batas: "beranda", perHalaman: 8 }),
    ]);

    kategori = hasilKategori.data || [];
    brand = hasilBrand.data || [];
    produk = hasilProduk.produk || [];
  }

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="wrap hero-isi">
          <span className="hero-label">Toko Listrik Sinar Kasih</span>
          <h1>Kebutuhan listrik, lampu &amp; perlengkapan rumah.</h1>
          <p>
            Temukan berbagai kebutuhan listrik dan perlengkapan rumah dari
            brand terpercaya, dengan pelayanan yang ramah di Ambon dan Maluku
            Tengah.
          </p>

          <Suspense fallback={null}>
            <div className="hero-cari">
              <KotakCari />
            </div>
          </Suspense>

          <div className="hero-tombol">
            <Link href="/kategori" className="btn">
              Belanja Produk
            </Link>
            <Link href="/toko" className="btn btn-garis">
              Lokasi Toko
            </Link>
          </div>
        </div>
      </section>

      {/* KATEGORI */}
      {kategori.length > 0 && (
        <section className="section">
          <div className="wrap">
            <div className="kepala-bagian">
              <div>
                <h2>Kategori Populer</h2>
                <p>Temukan kebutuhan berdasarkan kategori.</p>
              </div>
              <Link href="/kategori" className="tautan-semua">
                Lihat semua →
              </Link>
            </div>

            <div className="kat-grid">
              {kategori.map((k) => (
                <Link key={k.id} href={`/kategori/${k.slug}`} className="kat-kartu">
                  <div className="kat-foto">
                    {k.gambar_url ? (
                      <img src={k.gambar_url} alt={k.nama} loading="lazy" />
                    ) : (
                      <span>{k.nama.charAt(0)}</span>
                    )}
                  </div>
                  <span className="kat-nama">{k.nama}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BRAND */}
      {brand.length > 0 && (
        <section className="section">
          <div className="wrap">
            <div className="kepala-bagian">
              <div>
                <h2>Brand Populer</h2>
                <p>Pilihan brand yang tersedia di Sinar Kasih.</p>
              </div>
              <Link href="/kategori?tab=brand" className="tautan-semua">
                Lihat semua →
              </Link>
            </div>

            <div className="brand-grid">
              {brand.map((b) => (
                <Link
                  key={b.id}
                  href={`/kategori?tab=brand#brand-${b.slug}`}
                  className="brand-kartu"
                  title={b.nama}
                >
                  {b.logo_url ? (
                    <img src={b.logo_url} alt={b.nama} loading="lazy" />
                  ) : (
                    <span>{b.nama}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PRODUK */}
      <section className="section">
        <div className="wrap">
          <div className="kepala-bagian">
            <div>
              <h2>Produk Pilihan</h2>
              <p>Beberapa produk yang tersedia di katalog Sinar Kasih.</p>
            </div>
            <Link href="/cari" className="tautan-semua">
              Lihat semua →
            </Link>
          </div>

          {produk.length > 0 ? (
            <GridProduk produk={produk} />
          ) : (
            <div className="notice">Produk akan segera tersedia.</div>
          )}
        </div>
      </section>
    </>
  );
}
