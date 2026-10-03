// Lokasi file: app/page.js
// Beranda website Toko Listrik Sinar Kasih:
// hero, Produk Musiman (diatur di admin Tampilan Website, bisa dijadwalkan),
// kategori, brand, Produk Populer (otomatis dari Statistik), dan Produk Pilihan.
// Setiap bagian menampilkan maksimal 6 item, dan produk ditampilkan urut SKU.

import { Suspense } from "react";
import Link from "next/link";
import { getSupabase } from "../lib/supabase";
import { ambilKatalog, ambilProdukDariId, urutkanSku, GridProduk } from "./KatalogProduk";
import { KotakCari } from "./KontrolKatalog";

export const dynamic = "force-dynamic";

// Produk Populer baru ditampilkan jika sudah ada minimal 3 produk yang dilihat
const MIN_POPULER = 3;

function hariIniWIT() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jayapura",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// Musiman tampil jika aktif, ada produknya, dan hari ini masuk rentang tanggal (jika diisi)
function musimanBerlaku(m) {
  if (!m || !m.aktif || !Array.isArray(m.produk_ids) || m.produk_ids.length === 0) return false;
  const hari = hariIniWIT();
  if (m.tanggal_mulai && hari < m.tanggal_mulai) return false;
  if (m.tanggal_selesai && hari > m.tanggal_selesai) return false;
  return true;
}

export default async function Home() {
  const supabase = getSupabase();

  let kategori = [];
  let brand = [];
  let produk = [];
  let musiman = null;
  let produkMusiman = [];
  let produkPopuler = [];

  if (supabase) {
    const [hasilKategori, hasilBrand, hasilProduk, hasilMusiman, hasilPopuler] = await Promise.all([
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
        .limit(6),
      ambilKatalog(supabase, { batas: "beranda", urut: "sku_az", perHalaman: 6 }),
      supabase
        .from("beranda_musiman")
        .select("aktif, label, judul, keterangan, tanggal_mulai, tanggal_selesai, produk_ids")
        .eq("id", 1)
        .maybeSingle(),
      supabase.rpc("produk_populer", { p_hari: 30, p_batas: 6 }),
    ]);

    kategori = hasilKategori.data || [];
    brand = hasilBrand.data || [];
    produk = urutkanSku(hasilProduk.produk || []);

    // Produk Musiman (jika tabelnya belum dibuat, bagian ini dilewati)
    if (!hasilMusiman.error && musimanBerlaku(hasilMusiman.data)) {
      musiman = hasilMusiman.data;
      produkMusiman = urutkanSku(await ambilProdukDariId(supabase, musiman.produk_ids, 6));
    }

    // Produk Populer (otomatis dari Statistik)
    if (!hasilPopuler.error && (hasilPopuler.data || []).length >= MIN_POPULER) {
      produkPopuler = await ambilProdukDariId(
        supabase,
        hasilPopuler.data.map((p) => p.produk_id),
        6
      );
      if (produkPopuler.length < MIN_POPULER) produkPopuler = [];
      produkPopuler = urutkanSku(produkPopuler);
    }
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

      {/* PRODUK MUSIMAN */}
      {musiman && produkMusiman.length > 0 && (
        <section className="section musiman">
          <div className="wrap">
            <div className="kepala-bagian">
              <div>
                {musiman.label && musiman.label.trim() && (
                  <span className="musiman-label">{musiman.label.trim()}</span>
                )}
                <h2>{musiman.judul}</h2>
                {musiman.keterangan && <p>{musiman.keterangan}</p>}
              </div>
            </div>
            <GridProduk produk={produkMusiman} kolom={6} />
          </div>
        </section>
      )}

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
                  href={`/cari?brand=${encodeURIComponent(b.slug)}`}
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

      {/* PRODUK POPULER */}
      {produkPopuler.length > 0 && (
        <section className="section">
          <div className="wrap">
            <div className="kepala-bagian">
              <div>
                <h2>Produk Populer</h2>
                <p>Produk yang paling banyak dilihat pengunjung dalam 30 hari terakhir.</p>
              </div>
            </div>
            <GridProduk produk={produkPopuler} kolom={6} />
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
            <GridProduk produk={produk} kolom={6} />
          ) : (
            <div className="notice">Produk akan segera tersedia.</div>
          )}
        </div>
      </section>

      <style>{`
        .musiman { background: linear-gradient(180deg, #fcf3e6 0%, rgba(252, 243, 230, 0) 100%); }
        .musiman-label { display: inline-block; margin-bottom: 6px; padding: 3px 10px; border-radius: 999px; background: #c58a2b; color: #fff; font-size: 12px; font-weight: 800; letter-spacing: .02em; }
      `}</style>
    </>
  );
}
