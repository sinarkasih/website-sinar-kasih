// Lokasi file: app/produk/[id]/page.js
// Halaman Detail Produk: jejak kategori, galeri foto, label, harga + satuan,
// pilih jumlah & tambah ke troli, tombol tanya via WhatsApp, info produk,
// deskripsi, dan produk lain dari kategori yang sama.

import Link from "next/link";
import { getSupabase } from "../../../lib/supabase";
import { teksHarga, ambilKatalog, GridProduk } from "../../KatalogProduk";
import { buatPohon } from "../../KategoriPohon";
import AddToCart from "./AddToCart";
import GaleriProduk from "./GaleriProduk";

export const dynamic = "force-dynamic";

const ALAMAT_SITUS = "https://sinarkasih.co.id";
const WHATSAPP_CADANGAN = "6281285750033";

function nomorWa(teks) {
  let d = String(teks || "").replace(/\D/g, "");
  if (!d) return WHATSAPP_CADANGAN;
  if (d.startsWith("0")) d = "62" + d.slice(1);
  if (d.startsWith("8")) d = "62" + d;
  return d;
}

async function ambilProduk(supabase, id) {
  if (!/^\d+$/.test(String(id))) return null;
  const { data, error } = await supabase
    .from("produk")
    .select(
      `id, nama, deskripsi, sku, satuan, kategori_id,
       brand ( nama ),
       kategori ( id, nama, slug ),
       produk_gambar ( id, url, alt_text, utama ),
       harga_produk ( mode_harga, harga, harga_min, harga_max, aktif, variasi_id )`
    )
    .eq("id", id)
    .eq("aktif", true)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) console.error("DETAIL PRODUK ERROR:", error);
  return data || null;
}

function hargaAktif(produk) {
  const semua = (produk.harga_produk || []).filter((h) => h.aktif);
  return semua.find((h) => !h.variasi_id) || semua[0] || null;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const supabase = getSupabase();
  const produk = supabase ? await ambilProduk(supabase, id) : null;
  if (!produk) return { title: "Produk tidak ditemukan | Sinar Kasih" };

  const harga = hargaAktif(produk);
  const foto = [...(produk.produk_gambar || [])].sort((a, b) => Number(b.utama) - Number(a.utama))[0];
  const ringkas = (produk.deskripsi || "").replace(/\s+/g, " ").trim().slice(0, 150);
  const deskripsi =
    ringkas ||
    `${produk.nama}${harga ? ` — ${teksHarga(harga)}` : ""}. Tersedia di Toko Listrik Sinar Kasih Ambon.`;

  return {
    title: `${produk.nama} | Sinar Kasih`,
    description: deskripsi,
    openGraph: {
      title: produk.nama,
      description: deskripsi,
      url: `${ALAMAT_SITUS}/produk/${produk.id}`,
      images: foto?.url ? [{ url: foto.url }] : undefined,
    },
  };
}

function IkonWA() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.8-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.1 5.1 0 0 0 1.1 2.7 11.7 11.7 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.4-.3Z" />
    </svg>
  );
}

export default async function Page({ params }) {
  const { id } = await params;
  const supabase = getSupabase();

  if (!supabase) {
    return (
      <section className="section halaman-atas">
        <div className="wrap">
          <div className="notice">Koneksi database belum tersedia.</div>
        </div>
      </section>
    );
  }

  const produk = await ambilProduk(supabase, id);

  if (!produk) {
    return (
      <section className="section halaman-atas">
        <div className="wrap">
          <div className="kosong-cantik">
            <h2>Produk tidak ditemukan</h2>
            <p>Produk ini mungkin sudah tidak tersedia atau alamatnya salah.</p>
            <div className="pd-kosong-tombol">
              <Link href="/kategori" className="btn">Lihat Kategori Produk</Link>
              <Link href="/cari" className="btn btn-garis">Cari Produk</Link>
            </div>
          </div>
        </div>
        <style>{`.pd-kosong-tombol { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }`}</style>
      </section>
    );
  }

  const [{ data: semuaKategori }, { data: labelLink }, { data: kontak }] = await Promise.all([
    supabase.from("kategori").select("id, nama, slug, parent_id, urutan").eq("aktif", true),
    supabase.from("produk_label").select("label_id").eq("produk_id", produk.id),
    supabase.from("kontak_toko").select("whatsapp").limit(1).maybeSingle(),
  ]);

  let label = [];
  const labelIds = (labelLink || []).map((l) => l.label_id);
  if (labelIds.length > 0) {
    const { data } = await supabase
      .from("label_produk")
      .select("id, nama, warna, urutan")
      .in("id", labelIds)
      .eq("aktif", true)
      .order("urutan", { ascending: true });
    label = data || [];
  }

  const pohon = buatPohon(semuaKategori || []);
  const jalur = produk.kategori_id ? pohon.jalur(produk.kategori_id) : [];

  // Produk lain dari kategori yang sama
  let terkait = [];
  if (produk.kategori_id) {
    const hasil = await ambilKatalog(supabase, { kategoriId: produk.kategori_id, perHalaman: 7 });
    terkait = (hasil.produk || []).filter((p) => p.id !== produk.id).slice(0, 6);
  }

  const foto = [...(produk.produk_gambar || [])]
    .filter((g) => g.url)
    .sort((a, b) => Number(b.utama) - Number(a.utama) || (a.id || 0) - (b.id || 0));
  const harga = hargaAktif(produk);
  const modeHarga = harga?.mode_harga || null;
  const tanya = !modeHarga || modeHarga === "hubungi";
  const teks = harga ? teksHarga(harga) : "Tanya harga";
  const satuan = produk.satuan && produk.satuan.trim() ? produk.satuan.trim() : "";

  const pesanWA =
    `Halo Toko Listrik Sinar Kasih, saya ingin bertanya tentang produk ini:\n\n` +
    `${produk.nama}${produk.sku ? ` (SKU: ${produk.sku})` : ""}\n` +
    `${ALAMAT_SITUS}/produk/${produk.id}\n\n` +
    `Apakah stoknya tersedia?`;
  const linkWA = `https://wa.me/${nomorWa(kontak?.whatsapp)}?text=${encodeURIComponent(pesanWA)}`;

  return (
    <section className="section halaman-atas">
      <div className="wrap">
        <nav className="jejak" aria-label="Posisi halaman">
          <Link href="/">Beranda</Link>
          <span>›</span>
          <Link href="/kategori">Kategori</Link>
          {jalur.map((k) => (
            <span key={k.id} className="jejak-item">
              <span>›</span>
              <Link href={`/kategori/${k.slug}`}>{k.nama}</Link>
            </span>
          ))}
        </nav>

        <div className="pd-tata">
          <GaleriProduk foto={foto} nama={produk.nama} />

          <div className="pd-info">
            {(produk.brand?.nama || label.length > 0) && (
              <div className="pd-atas">
                {produk.brand?.nama && <span className="pd-brand">{produk.brand.nama}</span>}
                {label.map((l) => (
                  <span
                    key={l.id}
                    className="pd-label"
                    style={l.warna ? { background: l.warna, borderColor: l.warna, color: "#fff" } : undefined}
                  >
                    {l.nama}
                  </span>
                ))}
              </div>
            )}

            <h1 className="pd-judul">{produk.nama}</h1>

            <div className="pd-harga-kotak">
              <span className={`pd-harga ${tanya ? "tanya" : ""}`}>
                {teks}
                {!tanya && satuan && <small> / {satuan}</small>}
              </span>
              <span className="pd-harga-catatan">
                {tanya
                  ? "Harga dan ketersediaan akan dikonfirmasi oleh toko lewat WhatsApp."
                  : modeHarga === "pasti"
                  ? "Ketersediaan stok dikonfirmasi oleh toko lewat WhatsApp."
                  : "Harga final dan ketersediaan dikonfirmasi oleh toko lewat WhatsApp."}
              </span>
            </div>

            <AddToCart
              product={{
                id: produk.id,
                nama: produk.nama,
                harga: harga?.harga || 0,
                mode_harga: modeHarga || "hubungi",
                harga_min: harga?.harga_min || 0,
                harga_max: harga?.harga_max || 0,
                gambar: foto[0]?.url || "",
              }}
            />

            <a href={linkWA} target="_blank" rel="noopener noreferrer" className="pd-wa">
              <IkonWA /> Tanya Produk Ini via WhatsApp
            </a>

            <dl className="pd-spek">
              {produk.kategori?.nama && (
                <div>
                  <dt>Kategori</dt>
                  <dd>
                    {produk.kategori.slug ? (
                      <Link href={`/kategori/${produk.kategori.slug}`}>{produk.kategori.nama}</Link>
                    ) : (
                      produk.kategori.nama
                    )}
                  </dd>
                </div>
              )}
              {produk.brand?.nama && (
                <div>
                  <dt>Brand</dt>
                  <dd>{produk.brand.nama}</dd>
                </div>
              )}
              {produk.sku && (
                <div>
                  <dt>SKU</dt>
                  <dd>{produk.sku}</dd>
                </div>
              )}
              {satuan && (
                <div>
                  <dt>Satuan</dt>
                  <dd>{satuan}</dd>
                </div>
              )}
            </dl>

            <div className="pd-alur">
              <strong>Cara pesan</strong>
              <ol>
                <li>Masukkan produk ke troli, lalu lanjut ke Checkout.</li>
                <li>Isi nama, nomor WhatsApp, dan cabang yang Anda pilih.</li>
                <li>Kirim pesan WhatsApp yang muncul; toko akan mengonfirmasi pesanan Anda.</li>
              </ol>
              <Link href="/cara-pesan">Selengkapnya</Link>
            </div>
          </div>
        </div>

        {produk.deskripsi && produk.deskripsi.trim() && (
          <section className="pd-deskripsi">
            <h2>Deskripsi Produk</h2>
            <div className="pd-deskripsi-isi">{produk.deskripsi.trim()}</div>
          </section>
        )}

        {terkait.length > 0 && (
          <section className="pd-terkait">
            <div className="pd-terkait-kepala">
              <h2>Produk lain di {produk.kategori?.nama || "kategori ini"}</h2>
              {produk.kategori?.slug && (
                <Link href={`/kategori/${produk.kategori.slug}`}>Lihat semua →</Link>
              )}
            </div>
            <GridProduk produk={terkait} kolom={6} />
          </section>
        )}
      </div>

      <style>{`
        .pd-tata { display: grid; grid-template-columns: minmax(0, 440px) minmax(0, 1fr); gap: 44px; align-items: start; }

        /* Galeri */
        .pd-galeri { display: grid; gap: 12px; position: sticky; top: 90px; }
        .pd-utama { position: relative; aspect-ratio: 1 / 1; padding: 14px; box-sizing: border-box; border: 1px solid #eadfce; border-radius: 18px; background: #fff; overflow: hidden; display: grid; place-items: center; }
        .pd-utama img { width: 100%; height: 100%; object-fit: contain; }
        .pd-utama-kosong { display: grid; justify-items: center; gap: 8px; color: #b9a48e; font-size: 14px; }
        .pd-geser { position: absolute; top: 50%; transform: translateY(-50%); width: 40px; height: 40px; border: 1px solid #eadfce; border-radius: 50%; background: rgba(255,255,255,.92); color: #4b3326; font-size: 22px; line-height: 1; cursor: pointer; display: grid; place-items: center; }
        .pd-geser:hover { background: #fff; }
        .pd-geser.kiri { left: 10px; }
        .pd-geser.kanan { right: 10px; }
        .pd-hitung { position: absolute; bottom: 10px; right: 12px; padding: 3px 10px; border-radius: 999px; background: rgba(63,47,36,.7); color: #fff; font-size: 12.5px; font-weight: 600; }
        .pd-thumb { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 2px; }
        .pd-thumb button { width: 72px; height: 72px; flex-shrink: 0; padding: 0; border: 2px solid #eadfce; border-radius: 12px; background: #fff; overflow: hidden; cursor: pointer; }
        .pd-thumb button.aktif { border-color: #6f4c36; }
        .pd-thumb img { width: 100%; height: 100%; object-fit: contain; }

        /* Info */
        .pd-info { display: grid; gap: 18px; min-width: 0; }
        .pd-atas { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
        .pd-brand { font-size: 13px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; color: #9a6a2f; }
        .pd-label { padding: 3px 10px; border: 1px solid #e0cfbb; border-radius: 999px; background: #fff8ee; color: #6f4c36; font-size: 12.5px; font-weight: 700; }
        .situs h1.pd-judul { margin: 0 !important; font-size: clamp(24px, 2.8vw, 32px) !important; overflow-wrap: anywhere; }

        .pd-harga-kotak { display: grid; gap: 6px; padding: 16px 18px; border-radius: 14px; background: #fcf6ee; border: 1px solid #f0e2cf; }
        .pd-harga { font-size: clamp(24px, 2.6vw, 30px); font-weight: 800; color: #3f2f24; }
        .pd-harga small { font-size: 15px; font-weight: 600; color: #7a6555; }
        .pd-harga.tanya { font-size: 22px; color: #9a6a2f; }
        .pd-harga-catatan { font-size: 13.5px; color: #7a6555; }

        .pd-beli { display: grid; gap: 10px; }
        .pd-beli-baris { display: flex; gap: 10px; align-items: stretch; }
        .pd-qty { display: flex; align-items: center; border: 1px solid #e0cfbb; border-radius: 12px; background: #fff; overflow: hidden; }
        .pd-qty button { width: 44px; height: 50px; border: none; background: transparent; color: #4b3326; font-size: 20px; cursor: pointer; }
        .pd-qty button:hover:not(:disabled) { background: #f8f1e8; }
        .pd-qty button:disabled { color: #cdbba7; cursor: default; }
        .pd-qty input { width: 52px; height: 50px; border: none; text-align: center; font-size: 16px; font-weight: 700; color: #3f2f24; background: transparent; -moz-appearance: textfield; }
        .pd-qty input::-webkit-outer-spin-button, .pd-qty input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .pd-tambah { flex: 1; min-height: 50px; }
        .pd-berhasil { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; padding: 10px 14px; border-radius: 12px; background: #eaf7ed; color: #2f6b3f; font-size: 14px; font-weight: 600; }
        .pd-berhasil a { color: #2f6b3f; font-weight: 800; }

        .pd-wa { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 50px; padding: 0 18px; border: 1px solid #1f9d55; border-radius: 12px; background: #fff; color: #1a8a49; font-weight: 700; font-size: 15px; text-decoration: none; }
        .pd-wa:hover { background: #effaf3; }

        .pd-spek { margin: 0; display: grid; border: 1px solid #f0e7db; border-radius: 14px; overflow: hidden; background: #fff; }
        .pd-spek > div { display: grid; grid-template-columns: 120px 1fr; gap: 12px; padding: 11px 16px; font-size: 14.5px; }
        .pd-spek > div + div { border-top: 1px solid #f0e7db; }
        .pd-spek dt { color: #9a8571; }
        .pd-spek dd { margin: 0; color: #3f2f24; font-weight: 600; overflow-wrap: anywhere; }
        .pd-spek a { color: #6f4c36; }

        .pd-alur { padding: 14px 16px; border: 1px dashed #e0cfbb; border-radius: 14px; font-size: 14px; color: #6f5a49; }
        .pd-alur strong { color: #3f2f24; }
        .pd-alur ol { margin: 8px 0; padding-left: 20px; line-height: 1.7; }
        .pd-alur a { color: #6f4c36; font-weight: 700; }

        .pd-deskripsi { margin-top: 40px; padding: 24px 26px; border: 1px solid #eadfce; border-radius: 18px; background: #fff; }
        .pd-deskripsi h2, .pd-terkait h2 { margin: 0 0 12px; font-size: 20px; color: #3f2f24; }
        .pd-deskripsi-isi { white-space: pre-line; font-size: 15.5px; line-height: 1.75; color: #554840; overflow-wrap: anywhere; }

        .pd-terkait { margin-top: 44px; }
        .pd-terkait-kepala { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap; margin-bottom: 4px; }
        .pd-terkait-kepala a { color: #6f4c36; font-weight: 700; text-decoration: none; }
        .pd-terkait-kepala a:hover { text-decoration: underline; }

        @media (max-width: 860px) {
          .pd-tata { grid-template-columns: minmax(0, 1fr); gap: 22px; }
          .pd-galeri { position: static; }
          .pd-galeri { max-width: 460px; width: 100%; margin: 0 auto; }
          .pd-utama { aspect-ratio: 4 / 3; }
        }
        @media (max-width: 520px) {
          .pd-thumb button { width: 60px; height: 60px; }
          .pd-utama { aspect-ratio: 1 / 1; max-height: 78vw; }
          .pd-spek > div { grid-template-columns: 96px 1fr; }
          .pd-deskripsi { padding: 18px; }
        }
      `}</style>
    </section>
  );
}
