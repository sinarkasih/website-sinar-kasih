"use client";

// Lokasi file: app/admin/page.js
// Dashboard Admin Utama: ringkasan, grafik penjualan, status pesanan,
// produk & kategori terlaris, pesanan terbaru, aktivitas, aksi cepat, info toko.
// Semua angka dari data asli database.

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabase } from "../../lib/supabase";

const RENTANG = {
  "7": { label: "7 Hari Terakhir", hari: 7 },
  "30": { label: "30 Hari Terakhir", hari: 30 },
  bulan: { label: "Bulan Ini", hari: null },
};

const STATUS = {
  baru: { label: "Baru", warna: "#e0a13a" },
  diproses: { label: "Diproses", warna: "#3b74c4" },
  selesai: { label: "Selesai", warna: "#2f9e57" },
  dibatalkan: { label: "Dibatalkan", warna: "#c4483a" },
  lainnya: { label: "Lainnya", warna: "#b9a690" },
};

function rp(n) {
  return "Rp " + Math.round(Number(n) || 0).toLocaleString("id-ID");
}

function rpPendek(n) {
  const v = Number(n) || 0;
  if (v >= 1e9) return "Rp " + (v / 1e9).toFixed(1).replace(".0", "") + " M";
  if (v >= 1e6) return "Rp " + (v / 1e6).toFixed(1).replace(".0", "") + " jt";
  if (v >= 1e3) return "Rp " + Math.round(v / 1e3) + " rb";
  return "Rp " + v;
}

function hitungRentang(kode) {
  const akhir = new Date();
  const awal = new Date();
  awal.setHours(0, 0, 0, 0);
  if (kode === "bulan") {
    awal.setDate(1);
  } else {
    awal.setDate(awal.getDate() - (RENTANG[kode].hari - 1));
  }
  const lama = akhir.getTime() - awal.getTime();
  const awalLalu = new Date(awal.getTime() - lama);
  return { awal, akhir, awalLalu };
}

function persen(kini, lalu) {
  if (!lalu) return kini > 0 ? null : 0;
  return Math.round(((kini - lalu) / lalu) * 100);
}

function potong(arr, n) {
  const h = [];
  for (let i = 0; i < arr.length; i += n) h.push(arr.slice(i, i + n));
  return h;
}

function Ikon({ d, ukuran = 22 }) {
  return (
    <svg width={ukuran} height={ukuran} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {d}
    </svg>
  );
}

const IKON = {
  pesanan: <><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M2 3h3l2.7 12.4a1 1 0 0 0 1 .8h9.6a1 1 0 0 0 1-.8L21 7H6" /></>,
  uang: <><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6 12h.01M18 12h.01" /></>,
  baru: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  produk: <path d="M21 8 12 3 3 8v8l9 5 9-5V8ZM3 8l9 5 9-5M12 13v8" />,
  pelanggan: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6" /></>,
  tambah: <path d="M12 5v14M5 12h14" />,
  kategori: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  brand: <><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" /><circle cx="7.5" cy="7.5" r="1.5" /></>,
  tampilan: <><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></>,
  toko: <><path d="M4 10v10h16V10" /><path d="M3 10 5 4h14l2 6Z" /><path d="M10 20v-5h4v5" /></>,
};

function GrafikPenjualan({ hari }) {
  const lebar = 640;
  const tinggi = 220;
  const kiri = 56;
  const bawah = 26;
  const maksUang = Math.max(1, ...hari.map((h) => h.uang));
  const maksJumlah = Math.max(1, ...hari.map((h) => h.jumlah));
  const lebarArea = lebar - kiri - 10;
  const tinggiArea = tinggi - bawah - 10;
  const langkah = lebarArea / hari.length;
  const lebarBatang = Math.max(3, Math.min(22, langkah * 0.6));
  const titik = hari
    .map((h, i) => {
      const x = kiri + langkah * i + langkah / 2;
      const y = 10 + tinggiArea - (h.jumlah / maksJumlah) * tinggiArea;
      return `${x},${y}`;
    })
    .join(" ");
  const tiapLabel = Math.ceil(hari.length / 7);

  return (
    <svg viewBox={`0 0 ${lebar} ${tinggi}`} className="db-grafik" role="img" aria-label="Grafik penjualan per hari">
      {[0, 0.25, 0.5, 0.75, 1].map((f) => {
        const y = 10 + tinggiArea - f * tinggiArea;
        return (
          <g key={f}>
            <line x1={kiri} x2={lebar - 10} y1={y} y2={y} className="db-garis-bantu" />
            <text x={kiri - 8} y={y + 4} textAnchor="end" className="db-label-sumbu">
              {rpPendek(maksUang * f)}
            </text>
          </g>
        );
      })}
      {hari.map((h, i) => {
        const x = kiri + langkah * i + langkah / 2;
        const t = (h.uang / maksUang) * tinggiArea;
        return (
          <g key={h.kunci}>
            <rect x={x - lebarBatang / 2} y={10 + tinggiArea - t} width={lebarBatang} height={Math.max(0, t)} rx="3" className="db-batang">
              <title>{`${h.label}: ${rp(h.uang)} (${h.jumlah} pesanan)`}</title>
            </rect>
            {i % tiapLabel === 0 && (
              <text x={x} y={tinggi - 6} textAnchor="middle" className="db-label-sumbu">{h.label}</text>
            )}
          </g>
        );
      })}
      <polyline points={titik} className="db-garis" />
    </svg>
  );
}

function Donat({ data, total }) {
  const r = 52;
  const keliling = 2 * Math.PI * r;
  let geser = 0;
  return (
    <svg viewBox="0 0 140 140" className="db-donat" role="img" aria-label="Pesanan berdasarkan status">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#f0e7db" strokeWidth="18" />
      {data.filter((d) => d.nilai > 0).map((d) => {
        const panjang = (d.nilai / Math.max(1, total)) * keliling;
        const el = (
          <circle key={d.kunci} cx="70" cy="70" r={r} fill="none" stroke={d.warna} strokeWidth="18"
            strokeDasharray={`${panjang} ${keliling - panjang}`} strokeDashoffset={-geser}
            transform="rotate(-90 70 70)" />
        );
        geser += panjang;
        return el;
      })}
      <text x="70" y="68" textAnchor="middle" className="db-donat-angka">{total}</text>
      <text x="70" y="86" textAnchor="middle" className="db-donat-label">pesanan</text>
    </svg>
  );
}

export default function DashboardPage() {
  const [rentang, setRentang] = useState("30");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let batal = false;
    async function muat() {
      setData(null);
      setError("");
      const supabase = getSupabase();
      if (!supabase) {
        setError("Koneksi database belum tersedia.");
        return;
      }
      const { awal, akhir, awalLalu } = hitungRentang(rentang);

      const [psn, produkAktif, pelanggan, pesananBaru, terbaru, aktivitas, cabang] = await Promise.all([
        supabase.from("pesanan").select("id, created_at, status, total")
          .is("deleted_at", null).gte("created_at", awalLalu.toISOString())
          .order("created_at", { ascending: true }).limit(10000),
        supabase.from("produk").select("id", { count: "exact", head: true }).is("deleted_at", null).eq("aktif", true),
        supabase.from("pelanggan").select("id", { count: "exact", head: true }),
        supabase.from("pesanan").select("id", { count: "exact", head: true }).is("deleted_at", null).eq("status", "baru"),
        supabase.from("pesanan").select("id, nomor_pesanan, created_at, status, total, pelanggan:pelanggan_id ( nama ), cabang:cabang_id ( nama )")
          .is("deleted_at", null).order("created_at", { ascending: false }).limit(5),
        supabase.from("riwayat_perubahan").select("id, waktu, nama_pengguna, aksi, tabel, keterangan")
          .order("waktu", { ascending: false }).limit(5),
        supabase.from("cabang_toko").select("id, nama, alamat, telepon, google_maps_url, aktif, urutan")
          .eq("aktif", true).order("urutan", { ascending: true }),
      ]);

      if (psn.error) {
        if (!batal) setError("Data pesanan gagal dimuat: " + psn.error.message);
        return;
      }

      const semua = psn.data || [];
      const kini = semua.filter((p) => new Date(p.created_at) >= awal);
      const lalu = semua.filter((p) => new Date(p.created_at) < awal);
      const tidakBatal = (p) => p.status !== "dibatalkan";
      const jualKini = kini.filter((p) => p.status === "selesai").reduce((s, p) => s + Number(p.total || 0), 0);
      const jualLalu = lalu.filter((p) => p.status === "selesai").reduce((s, p) => s + Number(p.total || 0), 0);

      // Grafik per hari
      const peta = {};
      const hari = [];
      for (let d = new Date(awal); d <= akhir; d.setDate(d.getDate() + 1)) {
        const kunci = d.toISOString().slice(0, 10);
        const h = { kunci, label: d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }), uang: 0, jumlah: 0 };
        peta[kunci] = h;
        hari.push(h);
      }
      kini.forEach((p) => {
        const t = new Date(p.created_at);
        const kunci = new Date(t.getFullYear(), t.getMonth(), t.getDate()).toISOString().slice(0, 10);
        const h = peta[kunci] || peta[p.created_at.slice(0, 10)];
        if (!h) return;
        if (tidakBatal(p)) h.jumlah += 1;
        if (p.status === "selesai") h.uang += Number(p.total || 0);
      });

      // Status
      const hitungStatus = { baru: 0, diproses: 0, selesai: 0, dibatalkan: 0, lainnya: 0 };
      kini.forEach((p) => {
        hitungStatus[STATUS[p.status] ? p.status : "lainnya"] += 1;
      });

      // Produk & kategori terlaris (pesanan tidak dibatalkan pada periode ini)
      const idKini = kini.filter(tidakBatal).map((p) => p.id);
      const detail = [];
      for (const kelompok of potong(idKini, 200)) {
        const { data: d } = await supabase.from("detail_pesanan")
          .select("produk_id, nama_produk, jumlah").in("pesanan_id", kelompok);
        detail.push(...(d || []));
      }
      const perProduk = {};
      detail.forEach((d) => {
        const k = d.produk_id || d.nama_produk;
        if (!perProduk[k]) perProduk[k] = { id: d.produk_id, nama: d.nama_produk, jumlah: 0 };
        perProduk[k].jumlah += Number(d.jumlah) || 0;
      });
      const terlaris = Object.values(perProduk).sort((a, b) => b.jumlah - a.jumlah).slice(0, 5);

      const idProduk = [...new Set(detail.map((d) => d.produk_id).filter(Boolean))];
      const kategoriProduk = {};
      for (const kelompok of potong(idProduk, 200)) {
        const { data: k } = await supabase.from("produk_katalog").select("id, kategori_nama").in("id", kelompok);
        (k || []).forEach((x) => { kategoriProduk[x.id] = x.kategori_nama || "Tanpa kategori"; });
      }
      const perKategori = {};
      detail.forEach((d) => {
        const nama = kategoriProduk[d.produk_id] || "Tanpa kategori";
        perKategori[nama] = (perKategori[nama] || 0) + (Number(d.jumlah) || 0);
      });
      const kategoriTerlaris = Object.entries(perKategori)
        .map(([nama, jumlah]) => ({ nama, jumlah }))
        .sort((a, b) => b.jumlah - a.jumlah)
        .slice(0, 6);

      if (batal) return;
      setData({
        jumlahKini: kini.filter(tidakBatal).length,
        jumlahLalu: lalu.filter(tidakBatal).length,
        jualKini,
        jualLalu,
        pesananBaru: pesananBaru.count ?? 0,
        produkAktif: produkAktif.count ?? 0,
        pelanggan: pelanggan.count ?? 0,
        hari,
        status: Object.entries(hitungStatus).map(([kunci, nilai]) => ({ kunci, nilai, ...STATUS[kunci] })),
        totalStatus: kini.length,
        terlaris,
        kategoriTerlaris,
        terbaru: terbaru.data || [],
        aktivitas: aktivitas.error ? [] : aktivitas.data || [],
        cabang: cabang.data || [],
      });
    }
    muat();
    return () => {
      batal = true;
    };
  }, [rentang]);

  const pPesanan = data ? persen(data.jumlahKini, data.jumlahLalu) : 0;
  const pJual = data ? persen(data.jualKini, data.jualLalu) : 0;
  const maksKategori = data ? Math.max(1, ...data.kategoriTerlaris.map((k) => k.jumlah)) : 1;

  const kartu = [
    { kunci: "pesanan", label: "Total Pesanan", nilai: data?.jumlahKini, naik: pPesanan, warna: "merah", href: "/admin/pesanan" },
    { kunci: "uang", label: "Penjualan Selesai", nilai: data ? rp(data.jualKini) : null, naik: pJual, warna: "hijau", href: "/admin/pesanan" },
    { kunci: "baru", label: "Pesanan Baru (perlu diproses)", nilai: data?.pesananBaru, warna: "kuning", href: "/admin/pesanan" },
    { kunci: "produk", label: "Produk Aktif", nilai: data?.produkAktif, warna: "biru", href: "/admin/produk" },
    { kunci: "pelanggan", label: "Total Pelanggan", nilai: data?.pelanggan, warna: "ungu", href: "/admin/pelanggan" },
  ];

  const aksiCepat = [
    { href: "/admin/produk/tambah", label: "Tambah Produk", ikon: "tambah", warna: "biru" },
    { href: "/admin/kategori", label: "Kategori", ikon: "kategori", warna: "hijau" },
    { href: "/admin/brand", label: "Brand", ikon: "brand", warna: "ungu" },
    { href: "/admin/pesanan", label: "Pesanan", ikon: "pesanan", warna: "kuning" },
    { href: "/admin/tampilan", label: "Tampilan Website", ikon: "tampilan", warna: "merah" },
    { href: "/admin/toko", label: "Toko & Kontak", ikon: "toko", warna: "coklat" },
  ];

  function teksAktivitas(a) {
    const aksi = { tambah: "menambah", ubah: "mengubah", hapus: "menghapus" }[a.aksi] || a.aksi;
    const bagian = { produk: "produk", harga_produk: "harga", variasi_produk: "variasi", produk_gambar: "foto", produk_label: "label", label_produk: "label" }[a.tabel] || a.tabel;
    return `${a.nama_pengguna || "Seseorang"} ${aksi} ${bagian}`;
  }

  return (
    <div className="db">
      <div className="admin-page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Ringkasan aktivitas Toko Listrik Sinar Kasih.</p>
        </div>
        <select className="db-rentang" value={rentang} onChange={(e) => setRentang(e.target.value)} aria-label="Pilih periode">
          {Object.entries(RENTANG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {error && <div className="db-error">{error}</div>}

      <div className="db-kartu-grid">
        {kartu.map((k) => (
          <Link key={k.kunci} href={k.href} className="db-kartu">
            <span className={`db-kartu-ikon ${k.warna}`}><Ikon d={IKON[k.kunci]} /></span>
            <span className="db-kartu-teks">
              <strong>{data ? k.nilai : "–"}</strong>
              <span>{k.label}</span>
              {data && k.naik !== undefined && (
                <em className={k.naik === null || k.naik >= 0 ? "naik" : "turun"}>
                  {k.naik === null ? "Baru ada data" : `${k.naik >= 0 ? "▲" : "▼"} ${Math.abs(k.naik)}% dari periode sebelumnya`}
                </em>
              )}
            </span>
          </Link>
        ))}
      </div>

      <div className="db-baris dua">
        <section className="db-panel">
          <div className="db-panel-kepala">
            <h2>Grafik Penjualan</h2>
            <span className="db-legenda"><i className="batang" /> Penjualan selesai <i className="garis" /> Jumlah pesanan</span>
          </div>
          {data ? <GrafikPenjualan hari={data.hari} /> : <p className="db-redup">Memuat...</p>}
        </section>

        <section className="db-panel">
          <div className="db-panel-kepala"><h2>Pesanan per Status</h2></div>
          {data ? (
            <div className="db-donat-wrap">
              <Donat data={data.status} total={data.totalStatus} />
              <ul className="db-legenda-daftar">
                {data.status.filter((s) => s.kunci !== "lainnya" || s.nilai > 0).map((s) => (
                  <li key={s.kunci}><i style={{ background: s.warna }} />{s.label}<strong>{s.nilai}</strong></li>
                ))}
              </ul>
            </div>
          ) : <p className="db-redup">Memuat...</p>}
        </section>
      </div>

      <div className="db-baris tiga">
        <section className="db-panel">
          <div className="db-panel-kepala"><h2>Produk Terlaris</h2><Link href="/admin/produk" className="db-tautan">Lihat semua</Link></div>
          {data && data.terlaris.length === 0 && <p className="db-redup">Belum ada penjualan pada periode ini.</p>}
          <ol className="db-peringkat">
            {data?.terlaris.map((p, i) => (
              <li key={p.id || p.nama}><span className="db-no">{i + 1}</span><span className="db-nama">{p.nama}</span><strong>{p.jumlah}</strong></li>
            ))}
          </ol>
        </section>

        <section className="db-panel">
          <div className="db-panel-kepala"><h2>Kategori Terlaris</h2><Link href="/admin/kategori" className="db-tautan">Lihat semua</Link></div>
          {data && data.kategoriTerlaris.length === 0 && <p className="db-redup">Belum ada penjualan pada periode ini.</p>}
          <ul className="db-bar-daftar">
            {data?.kategoriTerlaris.map((k) => (
              <li key={k.nama}>
                <span className="db-nama">{k.nama}</span>
                <span className="db-bar"><span style={{ width: `${(k.jumlah / maksKategori) * 100}%` }} /></span>
                <strong>{k.jumlah}</strong>
              </li>
            ))}
          </ul>
        </section>

        <section className="db-panel">
          <div className="db-panel-kepala"><h2>Aktivitas Terbaru</h2><Link href="/admin/riwayat" className="db-tautan">Lihat semua</Link></div>
          {data && data.aktivitas.length === 0 && <p className="db-redup">Belum ada aktivitas tercatat.</p>}
          <ul className="db-aktivitas">
            {data?.aktivitas.map((a) => (
              <li key={a.id}>
                <span className={`db-titik ${a.aksi}`} />
                <span className="db-akt-isi">
                  <span>{teksAktivitas(a)}</span>
                  {a.keterangan && <span className="db-redup-kecil">{a.keterangan}</span>}
                </span>
                <span className="db-redup-kecil db-waktu">
                  {new Date(a.waktu).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="db-baris dua-sama">
        <section className="db-panel">
          <div className="db-panel-kepala"><h2>Pesanan Terbaru</h2><Link href="/admin/pesanan" className="db-tautan">Lihat semua</Link></div>
          {data && data.terbaru.length === 0 && <p className="db-redup">Belum ada pesanan.</p>}
          <ul className="db-pesanan">
            {data?.terbaru.map((p) => (
              <li key={p.id}>
                <span className="db-akt-isi">
                  <strong>{p.nomor_pesanan || `#${p.id}`}</strong>
                  <span className="db-redup-kecil">{p.pelanggan?.nama || "-"} · {p.cabang?.nama || "-"}</span>
                </span>
                <span className="db-uang">{rp(p.total)}</span>
                <span className={`db-status ${STATUS[p.status] ? p.status : "lainnya"}`}>{STATUS[p.status]?.label || p.status}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="db-panel">
          <div className="db-panel-kepala"><h2>Aksi Cepat</h2></div>
          <div className="db-aksi">
            {aksiCepat.map((a) => (
              <Link key={a.href} href={a.href} className="db-aksi-btn">
                <span className={`db-kartu-ikon ${a.warna}`}><Ikon d={IKON[a.ikon]} /></span>
                <span>{a.label}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {data && data.cabang.length > 0 && (
        <section className="db-panel">
          <div className="db-panel-kepala"><h2>Informasi Toko</h2><Link href="/admin/toko" className="db-tautan">Kelola</Link></div>
          <div className="db-cabang">
            {data.cabang.map((c) => (
              <div key={c.id} className="db-cabang-kartu">
                <strong>{c.nama}</strong>
                <span className="db-redup-kecil">{c.alamat || "-"}</span>
                <div className="db-cabang-aksi">
                  {c.google_maps_url && <a href={c.google_maps_url} target="_blank" rel="noreferrer" className="db-mini biru">Lihat Maps</a>}
                  {c.telepon && <a href={`https://wa.me/${String(c.telepon).replace(/\D/g, "").replace(/^0/, "62")}`} target="_blank" rel="noreferrer" className="db-mini hijau">WhatsApp</a>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <style>{`
        .db-rentang { height: 44px; padding: 0 12px; min-width: 190px; }
        .db-error { margin-bottom: 20px; padding: 12px 16px; border-radius: 12px; background: #fbebe7; border: 1px solid #efc7bc; color: #8a3b2b; font-size: 14px; }

        .db-kartu-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 14px; margin-bottom: 20px; }
        .db-kartu { display: flex; align-items: flex-start; gap: 12px; padding: 16px; background: #fff; border: 1px solid #eadfce; border-radius: 14px; color: #3f2f24; text-decoration: none; transition: border-color .15s ease, box-shadow .15s ease; }
        .db-kartu:hover { border-color: #d6c1a8; box-shadow: 0 4px 14px rgba(59,42,32,.06); }
        .db-kartu-ikon { width: 44px; height: 44px; flex-shrink: 0; display: grid; place-items: center; border-radius: 12px; }
        .db-kartu-ikon.merah { background: #fbe9e7; color: #c4483a; }
        .db-kartu-ikon.hijau { background: #e4f5e9; color: #2f7a46; }
        .db-kartu-ikon.kuning { background: #fdf0d8; color: #a8660f; }
        .db-kartu-ikon.biru { background: #e6efff; color: #2f5fa3; }
        .db-kartu-ikon.ungu { background: #efe9fb; color: #6b4fbb; }
        .db-kartu-ikon.coklat { background: #f3e8da; color: #6f4c36; }
        .db-kartu-teks { display: grid; gap: 2px; min-width: 0; }
        .db-kartu-teks strong { font-size: 21px; line-height: 1.2; }
        .db-kartu-teks span { font-size: 13px; color: #7d6957; }
        .db-kartu-teks em { font-style: normal; font-size: 12px; font-weight: 600; }
        .db-kartu-teks em.naik { color: #2f7a46; }
        .db-kartu-teks em.turun { color: #b23b2e; }

        .db-baris { display: grid; gap: 20px; margin-bottom: 20px; }
        .db-baris.dua { grid-template-columns: minmax(0, 1.8fr) minmax(0, 1fr); }
        .db-baris.tiga { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .db-baris.dua-sama { grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); }

        .db-panel { background: #fff; border: 1px solid #eadfce; border-radius: 14px; padding: 18px 20px; min-width: 0; }
        .db-panel + .db-panel { margin-top: 0; }
        .db-panel-kepala { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 14px; }
        .db-panel-kepala h2 { margin: 0 !important; font-size: 17px !important; }
        .db-tautan { font-size: 13.5px; font-weight: 700; color: #6f4c36; text-decoration: none; }
        .db-tautan:hover { text-decoration: underline; }
        .db-redup { margin: 0; color: #9a8571; font-size: 14px; }
        .db-redup-kecil { display: block; font-size: 12.5px; color: #9a8571; }

        .db-grafik { width: 100%; height: auto; display: block; }
        .db-garis-bantu { stroke: #f0e7db; stroke-width: 1; }
        .db-label-sumbu { font-size: 10.5px; fill: #9a8571; }
        .db-batang { fill: #d9b98f; }
        .db-batang:hover { fill: #c58a2b; }
        .db-garis { fill: none; stroke: #6f4c36; stroke-width: 2; stroke-linejoin: round; }
        .db-legenda { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; color: #7d6957; }
        .db-legenda i { display: inline-block; width: 12px; height: 12px; border-radius: 3px; margin-left: 8px; }
        .db-legenda i.batang { background: #d9b98f; }
        .db-legenda i.garis { height: 3px; background: #6f4c36; }

        .db-donat-wrap { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; }
        .db-donat { width: 150px; height: 150px; flex-shrink: 0; }
        .db-donat-angka { font-size: 24px; font-weight: 800; fill: #3f2f24; }
        .db-donat-label { font-size: 11px; fill: #9a8571; }
        .db-legenda-daftar { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; flex: 1; min-width: 150px; }
        .db-legenda-daftar li { display: flex; align-items: center; gap: 8px; font-size: 14px; }
        .db-legenda-daftar i { width: 10px; height: 10px; border-radius: 50%; }
        .db-legenda-daftar strong { margin-left: auto; }

        .db-peringkat, .db-bar-daftar, .db-aktivitas, .db-pesanan { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
        .db-peringkat li { display: flex; align-items: center; gap: 10px; font-size: 14px; }
        .db-no { width: 26px; height: 26px; flex-shrink: 0; display: grid; place-items: center; border-radius: 50%; background: #f3e8da; color: #6f4c36; font-weight: 700; font-size: 12.5px; }
        .db-nama { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .db-bar-daftar li { display: grid; grid-template-columns: minmax(0, 1fr) 1.2fr auto; align-items: center; gap: 10px; font-size: 14px; }
        .db-bar { height: 10px; border-radius: 999px; background: #f3ece2; overflow: hidden; }
        .db-bar span { display: block; height: 100%; border-radius: 999px; background: linear-gradient(90deg, #c58a2b, #6f4c36); }
        .db-aktivitas li, .db-pesanan li { display: flex; align-items: center; gap: 10px; font-size: 14px; }
        .db-titik { width: 10px; height: 10px; flex-shrink: 0; border-radius: 50%; background: #3b74c4; }
        .db-titik.tambah { background: #2f9e57; }
        .db-titik.hapus { background: #c4483a; }
        .db-akt-isi { flex: 1; min-width: 0; display: grid; }
        .db-akt-isi > span:first-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .db-waktu { white-space: nowrap; }
        .db-uang { font-weight: 700; white-space: nowrap; }
        .db-status { padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; white-space: nowrap; }
        .db-status.baru { background: #fff3d9; color: #8a641d; }
        .db-status.diproses { background: #eaf2ff; color: #315d91; }
        .db-status.selesai { background: #eaf7ed; color: #347045; }
        .db-status.dibatalkan { background: #fbecec; color: #943f3f; }
        .db-status.lainnya { background: #fdf0e1; color: #9a5b16; }

        .db-aksi { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
        .db-aksi-btn { display: grid; justify-items: center; gap: 8px; padding: 14px 8px; border: 1px solid #f0e7db; border-radius: 12px; background: #fcf9f5; color: #3f2f24; font-size: 13.5px; font-weight: 600; text-align: center; text-decoration: none; }
        .db-aksi-btn:hover { border-color: #d6c1a8; background: #fff; }

        .db-cabang { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
        .db-cabang-kartu { display: grid; gap: 4px; padding: 14px; border: 1px solid #f0e7db; border-radius: 12px; background: #fcf9f5; }
        .db-cabang-aksi { display: flex; gap: 8px; margin-top: 8px; }
        .db-mini { padding: 6px 12px; border-radius: 8px; color: #fff; font-size: 13px; font-weight: 700; text-decoration: none; }
        .db-mini.biru { background: #3b74c4; }
        .db-mini.hijau { background: #25d366; }

        @media (max-width: 1250px) {
          .db-kartu-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .db-baris.tiga { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 1000px) {
          .db-baris.dua, .db-baris.dua-sama { grid-template-columns: 1fr; }
        }
        @media (max-width: 700px) {
          .db-kartu-grid { grid-template-columns: 1fr 1fr; }
          .db-baris.tiga { grid-template-columns: 1fr; }
          .db-aksi { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .db-rentang { width: 100%; }
        }
      `}</style>
    </div>
  );
}
