// Lokasi file: app/KatalogProduk.js
// Bagian bersama untuk daftar produk di website toko:
// pengambilan data per halaman, kartu produk, dan tombol halaman.

import Link from "next/link";

export const URUTAN_PRODUK = {
  terbaru: { label: "Terbaru", kolom: "id", naik: false },
  sku_az: { label: "SKU A–Z", kolom: "sku", naik: true },
  sku_za: { label: "SKU Z–A", kolom: "sku", naik: false },
  nama_az: { label: "Nama A–Z", kolom: "nama", naik: true },
  nama_za: { label: "Nama Z–A", kolom: "nama", naik: false },
  harga_rendah: { label: "Harga terendah", kolom: "harga_urut", naik: true },
  harga_tinggi: { label: "Harga tertinggi", kolom: "harga_urut", naik: false },
};

export function teksHarga(p) {
  const rp = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");
  if (p.mode_harga === "pasti") return rp(p.harga);
  if (p.mode_harga === "mulai_dari") return "Mulai " + rp(p.harga ?? p.harga_min);
  if (p.mode_harga === "range") return rp(p.harga_min) + " – " + rp(p.harga_max);
  if (p.mode_harga === "hubungi") return "Hubungi kami";
  return "Tanya harga";
}

// Ambil produk per halaman dari view produk_katalog + foto utamanya
export async function ambilKatalog(
  supabase,
  { kategoriId, kategoriIds, brandId, cari, urut = "terbaru", halaman = 1, perHalaman = 24, batas }
) {
  const aturan = URUTAN_PRODUK[urut] || URUTAN_PRODUK.terbaru;
  const dari = (halaman - 1) * perHalaman;

  let q = supabase
    .from("produk_katalog")
    .select(
      "id, nama, slug, kategori_nama, brand_nama, mode_harga, harga, harga_min, harga_max, produk_unggulan, tampilkan_di_beranda",
      { count: "exact" }
    )
    .eq("aktif", true)
    .is("deleted_at", null);

  if (kategoriIds && kategoriIds.length > 0) q = q.in("kategori_id", kategoriIds);
  else if (kategoriId) q = q.eq("kategori_id", kategoriId);
  if (brandId) q = q.eq("brand_id", brandId);

  if (cari) {
    const kata = String(cari).replace(/[,()%*]/g, " ").trim();
    if (kata) q = q.or(`nama.ilike.%${kata}%,sku.ilike.%${kata}%`);
  }

  if (batas === "beranda") {
    q = q
      .order("produk_unggulan", { ascending: false, nullsFirst: false })
      .order("tampilkan_di_beranda", { ascending: false, nullsFirst: false });
  }

  q = q
    .order(aturan.kolom, { ascending: aturan.naik, nullsFirst: false })
    .order("id", { ascending: false })
    .range(dari, dari + perHalaman - 1);

  const { data, count, error } = await q;
  if (error) {
    console.error("KATALOG ERROR:", error);
    return { produk: [], total: 0, error: error.message };
  }

  const produk = data || [];
  const ids = produk.map((p) => p.id);
  const foto = {};

  if (ids.length > 0) {
    const { data: gambar } = await supabase
      .from("produk_gambar")
      .select("produk_id, url, utama, id")
      .in("produk_id", ids)
      .order("utama", { ascending: false })
      .order("id", { ascending: true });

    (gambar || []).forEach((g) => {
      if (!foto[g.produk_id]) foto[g.produk_id] = g.url;
    });
  }

  return {
    produk: produk.map((p) => ({ ...p, foto: foto[p.id] || null })),
    total: count || 0,
    error: null,
  };
}

function IkonFoto() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="m21 16-5-5-9 9" />
    </svg>
  );
}

export function KartuProduk({ produk }) {
  const harga = teksHarga(produk);
  const tanya = !produk.mode_harga || produk.mode_harga === "hubungi";

  return (
    <Link href={`/produk/${produk.id}`} className="kp-kartu">
      <div className="kp-foto">
        {produk.foto ? (
          <img src={produk.foto} alt={produk.nama} loading="lazy" />
        ) : (
          <span className="kp-kosong">
            <IkonFoto />
            Foto segera hadir
          </span>
        )}
      </div>
      <div className="kp-isi">
        {produk.brand_nama && <span className="kp-brand">{produk.brand_nama}</span>}
        <h3 className="kp-nama">{produk.nama}</h3>
        <span className={`kp-harga ${tanya ? "tanya" : ""}`}>{harga}</span>
      </div>
    </Link>
  );
}

export function GridProduk({ produk, kolom }) {
  return (
    <div className={`kp-grid ${kolom === 6 ? "kp-enam" : ""}`}>
      {produk.map((p) => (
        <KartuProduk key={p.id} produk={p} />
      ))}
    </div>
  );
}

// Tombol halaman 1 2 3 ... (berupa link, cocok untuk Google)
export function PaginasiPublik({ halaman, total, perHalaman, buatHref }) {
  const totalHalaman = Math.max(1, Math.ceil(total / perHalaman));
  if (totalHalaman <= 1) return null;

  const nomor = new Set([1, totalHalaman, halaman - 1, halaman, halaman + 1]);
  const urut = [...nomor].filter((n) => n >= 1 && n <= totalHalaman).sort((a, b) => a - b);
  const isi = [];
  urut.forEach((n, i) => {
    if (i > 0 && n - urut[i - 1] > 1) isi.push("…" + n);
    isi.push(n);
  });

  return (
    <nav className="pp" aria-label="Halaman">
      {halaman > 1 ? (
        <Link href={buatHref(halaman - 1)} className="pp-btn" aria-label="Sebelumnya">‹</Link>
      ) : (
        <span className="pp-btn mati">‹</span>
      )}
      {isi.map((n) =>
        typeof n === "string" ? (
          <span key={n} className="pp-titik">…</span>
        ) : (
          <Link
            key={n}
            href={buatHref(n)}
            className={`pp-btn ${n === halaman ? "aktif" : ""}`}
            aria-current={n === halaman ? "page" : undefined}
          >
            {n}
          </Link>
        )
      )}
      {halaman < totalHalaman ? (
        <Link href={buatHref(halaman + 1)} className="pp-btn" aria-label="Berikutnya">›</Link>
      ) : (
        <span className="pp-btn mati">›</span>
      )}
    </nav>
  );
}

// Ambil produk berdasarkan daftar id (urutan mengikuti daftar id),
// hanya produk aktif yang tidak ada di Trash, lengkap dengan foto utamanya.
export async function ambilProdukDariId(supabase, ids, batas = 6) {
  const daftar = [...new Set((ids || []).map(Number).filter((n) => Number.isFinite(n)))];
  if (daftar.length === 0) return [];

  const { data, error } = await supabase
    .from("produk_katalog")
    .select("id, nama, slug, kategori_nama, brand_nama, mode_harga, harga, harga_min, harga_max")
    .in("id", daftar)
    .eq("aktif", true)
    .is("deleted_at", null);

  if (error) {
    console.error("PRODUK DARI ID ERROR:", error);
    return [];
  }

  const urutan = new Map(daftar.map((id, i) => [id, i]));
  const produk = (data || [])
    .sort((a, b) => (urutan.get(Number(a.id)) ?? 999) - (urutan.get(Number(b.id)) ?? 999))
    .slice(0, batas);

  const foto = {};
  if (produk.length > 0) {
    const { data: gambar } = await supabase
      .from("produk_gambar")
      .select("produk_id, url, utama, id")
      .in("produk_id", produk.map((p) => p.id))
      .order("utama", { ascending: false })
      .order("id", { ascending: true });
    (gambar || []).forEach((g) => {
      if (!foto[g.produk_id]) foto[g.produk_id] = g.url;
    });
  }

  return produk.map((p) => ({ ...p, foto: foto[p.id] || null }));
}
