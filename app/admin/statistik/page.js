"use client";

// Lokasi file: app/admin/statistik/page.js
// Statistik (khusus Admin Utama): kunjungan website, pengunjung unik,
// klik WhatsApp, pesanan website per hari/minggu/bulan, produk paling sering
// dilihat, sumber pengunjung, halaman terpopuler, dan asal klik WhatsApp.
// Data diambil dari fungsi database statistik_ringkas (lihat supabase/statistik.sql).

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "../../../lib/supabase";

const RENTANG = [
  { hari: 7, label: "7 Hari" },
  { hari: 30, label: "30 Hari" },
  { hari: 90, label: "90 Hari" },
  { hari: 365, label: "1 Tahun" },
];

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

const NAMA_HALAMAN = {
  "/": "Beranda",
  "/kategori": "Kategori Produk",
  "/cari": "Cari Produk",
  "/troli": "Troli",
  "/checkout": "Checkout",
  "/info": "Informasi & Layanan",
  "/toko": "Toko Kami",
  "/tentang": "Tentang Kami",
  "/loker": "Lowongan Kerja",
  "/cara-pesan": "Cara Pesan",
  "/kebijakan-privasi": "Kebijakan Privasi",
};

function angka(n) {
  return new Intl.NumberFormat("id-ID").format(Number(n) || 0);
}

function rp(n) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(n) || 0);
}

function rpPendek(n) {
  const v = Number(n) || 0;
  if (v >= 1e9) return (v / 1e9).toLocaleString("id-ID", { maximumFractionDigits: 1 }) + " M";
  if (v >= 1e6) return (v / 1e6).toLocaleString("id-ID", { maximumFractionDigits: 1 }) + " jt";
  if (v >= 1e3) return Math.round(v / 1e3) + " rb";
  return String(Math.round(v));
}

function bacaTanggal(s) {
  const [y, m, d] = String(s).split("-").map(Number);
  return new Date(y, m - 1, d);
}

function labelTanggal(t) {
  return `${t.getDate()} ${BULAN[t.getMonth()]}`;
}

// Gabungkan data harian menjadi per hari / per minggu (mulai Senin) / per bulan
function kelompokkan(harian, cara) {
  if (cara === "hari") {
    return harian.map((h) => {
      const t = bacaTanggal(h.tgl);
      return { ...h, kunci: h.tgl, label: labelTanggal(t), judul: t.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" }) };
    });
  }
  const peta = new Map();
  harian.forEach((h) => {
    const t = bacaTanggal(h.tgl);
    let kunci;
    let label;
    let judul;
    if (cara === "minggu") {
      const senin = new Date(t);
      senin.setDate(t.getDate() - ((t.getDay() + 6) % 7));
      kunci = senin.toISOString().slice(0, 10);
      label = labelTanggal(senin);
      judul = `Minggu mulai ${labelTanggal(senin)}`;
    } else {
      kunci = `${t.getFullYear()}-${t.getMonth()}`;
      label = `${BULAN[t.getMonth()]} ${String(t.getFullYear()).slice(2)}`;
      judul = `${BULAN[t.getMonth()]} ${t.getFullYear()}`;
    }
    if (!peta.has(kunci)) peta.set(kunci, { kunci, label, judul, kunjungan: 0, pengunjung: 0, klik_wa: 0, pesanan: 0, nilai: 0 });
    const g = peta.get(kunci);
    g.kunjungan += Number(h.kunjungan) || 0;
    g.pengunjung += Number(h.pengunjung) || 0;
    g.klik_wa += Number(h.klik_wa) || 0;
    g.pesanan += Number(h.pesanan) || 0;
    g.nilai += Number(h.nilai) || 0;
  });
  return [...peta.values()];
}

function caraOtomatis(jumlahHari) {
  if (jumlahHari <= 31) return "hari";
  if (jumlahHari <= 120) return "minggu";
  return "bulan";
}

function namaHalaman(path, namaProduk) {
  if (!path) return "-";
  if (NAMA_HALAMAN[path]) return NAMA_HALAMAN[path];
  const produk = path.match(/^\/produk\/(\d+)/);
  if (produk) return namaProduk[produk[1]] ? `Produk: ${namaProduk[produk[1]]}` : `Produk #${produk[1]}`;
  const kategori = path.match(/^\/kategori\/([^/]+)/);
  if (kategori) {
    const nama = decodeURIComponent(kategori[1]).replace(/-/g, " ");
    return `Kategori: ${nama.charAt(0).toUpperCase()}${nama.slice(1)}`;
  }
  return path;
}

function Ikon({ nama, ukuran = 24 }) {
  const isi = {
    mata: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
    orang: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6" /></>,
    wa: <><path d="M4 20l1.3-4A8 8 0 1 1 8 18.7L4 20Z" /><path d="M9 10c.5 2 2 3.5 4 4" /></>,
    troli: <><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M2 3h3l2.7 12.4a1 1 0 0 0 1 .8h9.6a1 1 0 0 0 1-.8L21 7H6" /></>,
    foto: <><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.8" /><path d="m21 16-5-5-8 8" /></>,
    muat: <><path d="M21 12a9 9 0 1 1-2.6-6.4" /><path d="M21 4v5h-5" /></>,
  }[nama];
  return (
    <svg width={ukuran} height={ukuran} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {isi}
    </svg>
  );
}

// Grafik batang + garis sederhana
function Grafik({ data, batang, garis, formatSumbu = angka, formatBatang = angka, labelBatang, labelGaris }) {
  const lebar = 680;
  const tinggi = 230;
  const kiri = 54;
  const bawah = 26;
  const lebarArea = lebar - kiri - 10;
  const tinggiArea = tinggi - bawah - 12;
  const maksBatang = Math.max(1, ...data.map((d) => Number(d[batang]) || 0));
  const maksGaris = garis ? Math.max(1, ...data.map((d) => Number(d[garis]) || 0)) : 1;
  const skalaGaris = garis ? Math.max(maksBatang, maksGaris) : 1;
  const maksSumbu = garis ? skalaGaris : maksBatang;
  const langkah = lebarArea / Math.max(1, data.length);
  const lebarBatang = Math.max(3, Math.min(26, langkah * 0.6));
  const tiapLabel = Math.ceil(data.length / 8);

  const titik = garis
    ? data
        .map((d, i) => {
          const x = kiri + langkah * i + langkah / 2;
          const y = 12 + tinggiArea - ((Number(d[garis]) || 0) / skalaGaris) * tinggiArea;
          return `${x},${y}`;
        })
        .join(" ")
    : "";

  return (
    <svg viewBox={`0 0 ${lebar} ${tinggi}`} className="st-grafik" role="img" aria-label={labelBatang}>
      {[0, 0.25, 0.5, 0.75, 1].map((f) => {
        const y = 12 + tinggiArea - f * tinggiArea;
        return (
          <g key={f}>
            <line x1={kiri} x2={lebar - 10} y1={y} y2={y} className="st-garis-bantu" />
            <text x={kiri - 8} y={y + 4} textAnchor="end" className="st-label-sumbu">
              {formatSumbu(maksSumbu * f)}
            </text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const x = kiri + langkah * i + langkah / 2;
        const t = ((Number(d[batang]) || 0) / maksSumbu) * tinggiArea;
        return (
          <g key={d.kunci}>
            <rect x={x - lebarBatang / 2} y={12 + tinggiArea - t} width={lebarBatang} height={Math.max(0, t)} rx="3" className="st-batang">
              <title>
                {`${d.judul}\n${labelBatang}: ${formatBatang(d[batang])}${garis ? `\n${labelGaris}: ${angka(d[garis])}` : ""}`}
              </title>
            </rect>
            {i % tiapLabel === 0 && (
              <text x={x} y={tinggi - 7} textAnchor="middle" className="st-label-sumbu">{d.label}</text>
            )}
          </g>
        );
      })}
      {garis && data.length > 1 && <polyline points={titik} className="st-garis" />}
    </svg>
  );
}

function BarisBatang({ label, nilai, maks, sub, href }) {
  const isi = (
    <>
      <span className="st-bb-atas">
        <span className="st-bb-label">{label}</span>
        <strong>{angka(nilai)}</strong>
      </span>
      <span className="st-bb-jalur"><span style={{ width: `${Math.max(2, (nilai / Math.max(1, maks)) * 100)}%` }} /></span>
      {sub && <span className="st-bb-sub">{sub}</span>}
    </>
  );
  return href ? (
    <Link href={href} className="st-bb" target="_blank">{isi}</Link>
  ) : (
    <div className="st-bb">{isi}</div>
  );
}

export default function StatistikPage() {
  const [hari, setHari] = useState(30);
  const [data, setData] = useState(null);
  const [produk, setProduk] = useState({});
  const [caraPesanan, setCaraPesanan] = useState("minggu");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const muat = useCallback(async () => {
    setLoading(true);
    setError("");
    const supabase = getSupabase();
    if (!supabase) {
      setError("Koneksi database belum tersedia.");
      setLoading(false);
      return;
    }

    const { data: hasil, error: gagal } = await supabase.rpc("statistik_ringkas", { p_hari: hari });
    if (gagal) {
      const belumAda = /statistik_ringkas|function|schema cache/i.test(gagal.message || "");
      setError(
        belumAda
          ? "Fungsi statistik belum ada di database. Jalankan dulu file supabase/statistik.sql di Supabase > SQL Editor."
          : gagal.message
      );
      setData(null);
      setLoading(false);
      return;
    }

    setData(hasil);

    // Nama & foto produk yang paling sering dilihat
    const ids = (hasil?.produk || []).map((p) => p.produk_id);
    const halamanProduk = (hasil?.halaman || [])
      .map((h) => (h.path || "").match(/^\/produk\/(\d+)/))
      .filter(Boolean)
      .map((m) => Number(m[1]));
    const semuaId = [...new Set([...ids, ...halamanProduk])];
    if (semuaId.length > 0) {
      const [{ data: pr }, { data: gb }] = await Promise.all([
        supabase.from("produk").select("id, nama, deleted_at").in("id", semuaId),
        supabase.from("produk_gambar").select("produk_id, url, utama").in("produk_id", semuaId),
      ]);
      const peta = {};
      (pr || []).forEach((p) => {
        peta[p.id] = { nama: p.nama, terhapus: !!p.deleted_at, foto: null };
      });
      (gb || []).forEach((g) => {
        if (!peta[g.produk_id]) return;
        if (!peta[g.produk_id].foto || g.utama) peta[g.produk_id].foto = g.url;
      });
      setProduk(peta);
    } else {
      setProduk({});
    }
    setLoading(false);
  }, [hari]);

  useEffect(() => {
    muat();
  }, [muat]);

  useEffect(() => {
    setCaraPesanan(hari <= 7 ? "hari" : hari <= 90 ? "minggu" : "bulan");
  }, [hari]);

  const harian = data?.harian || [];
  const total = data?.total || {};
  const totalPesanan = harian.reduce((s, h) => s + (Number(h.pesanan) || 0), 0);
  const totalNilai = harian.reduce((s, h) => s + (Number(h.nilai) || 0), 0);
  const grafikKunjungan = kelompokkan(harian, caraOtomatis(harian.length));
  const grafikPesanan = kelompokkan(harian, caraPesanan);
  const namaProduk = Object.fromEntries(Object.entries(produk).map(([id, p]) => [id, p.nama]));
  const belumAdaData = data && Number(total.kunjungan || 0) === 0 && Number(total.klik_wa || 0) === 0;
  const persenWA = total.pengunjung ? Math.round((Number(total.klik_wa || 0) / Number(total.pengunjung)) * 100) : 0;

  const kartu = [
    { kunci: "mata", label: "Halaman dibuka", nilai: total.kunjungan, warna: "coklat" },
    { kunci: "orang", label: "Pengunjung unik", nilai: total.pengunjung, warna: "biru" },
    { kunci: "wa", label: "Klik WhatsApp", nilai: total.klik_wa, warna: "hijau", sub: total.pengunjung ? `≈ ${persenWA}% dari pengunjung` : null },
    { kunci: "troli", label: "Pesanan website", nilai: totalPesanan, warna: "kuning", sub: totalPesanan ? rp(totalNilai) : null },
  ];

  const keteranganCara = { hari: "per hari", minggu: "per minggu", bulan: "per bulan" };
  const maksSumber = Math.max(1, ...(data?.sumber || []).map((s) => Number(s.jumlah) || 0));
  const maksHalaman = Math.max(1, ...(data?.halaman || []).map((s) => Number(s.jumlah) || 0));
  const maksWA = Math.max(1, ...(data?.wa_dari || []).map((s) => Number(s.jumlah) || 0));

  return (
    <main className="admin-content">
      <div className="admin-page-header st-kepala">
        <div>
          <h1>Statistik</h1>
          <p>Pantau kunjungan website, klik WhatsApp, dan produk yang paling banyak dicari pembeli.</p>
        </div>
        <div className="st-rentang" role="group" aria-label="Pilih rentang waktu">
          {RENTANG.map((r) => (
            <button
              key={r.hari}
              type="button"
              className={hari === r.hari ? "dipilih" : ""}
              onClick={() => setHari(r.hari)}
              aria-pressed={hari === r.hari}
            >
              {r.label}
            </button>
          ))}
          <button type="button" className="st-segarkan" onClick={muat} disabled={loading} title="Muat ulang" aria-label="Muat ulang">
            <Ikon nama="muat" ukuran={18} />
          </button>
        </div>
      </div>

      {error && <div className="admin-message admin-message-error st-pesan">{error}</div>}

      {belumAdaData && (
        <div className="st-info">
          <strong>Belum ada kunjungan yang tercatat.</strong> Pencatatan dimulai sejak fitur Statistik dipasang, jadi angkanya
          akan bertambah seiring pengunjung membuka website. Perangkat yang pernah dipakai login admin tidak ikut dihitung.
        </div>
      )}

      <div className={`st-kartu-grid ${loading ? "st-redup" : ""}`}>
        {kartu.map((k) => (
          <div key={k.kunci} className="st-kartu">
            <span className={`st-kartu-ikon ${k.warna}`}><Ikon nama={k.kunci} /></span>
            <span className="st-kartu-teks">
              <strong>{data ? angka(k.nilai) : "–"}</strong>
              <span>{k.label}</span>
              {k.sub && <small>{k.sub}</small>}
            </span>
          </div>
        ))}
      </div>

      <div className="st-baris dua">
        <section className="st-panel">
          <div className="st-panel-kepala">
            <h2>Kunjungan Website</h2>
            <span className="st-legenda">
              <span><i className="batang" /> Halaman dibuka</span>
              <span><i className="garis" /> Pengunjung</span>
            </span>
          </div>
          <p className="st-catatan">Ditampilkan {keteranganCara[caraOtomatis(harian.length)]}. Arahkan kursor ke batang untuk melihat angkanya.</p>
          {data ? (
            <Grafik data={grafikKunjungan} batang="kunjungan" garis="pengunjung" labelBatang="Halaman dibuka" labelGaris="Pengunjung" />
          ) : (
            <p className="st-redup-teks">{loading ? "Memuat..." : "-"}</p>
          )}
        </section>

        <section className="st-panel">
          <div className="st-panel-kepala">
            <h2>Pesanan Website</h2>
            <div className="st-tab" role="group" aria-label="Kelompokkan pesanan">
              {["hari", "minggu", "bulan"].map((c) => (
                <button key={c} type="button" className={caraPesanan === c ? "dipilih" : ""} onClick={() => setCaraPesanan(c)}>
                  {c === "hari" ? "Harian" : c === "minggu" ? "Mingguan" : "Bulanan"}
                </button>
              ))}
            </div>
          </div>
          <p className="st-catatan">Nilai pesanan dari website (tanpa yang dibatalkan), bukan omzet di Accurate.</p>
          {data ? (
            <Grafik
              data={grafikPesanan}
              batang="nilai"
              garis={null}
              formatSumbu={rpPendek}
              formatBatang={(v) => rp(v)}
              labelBatang="Nilai pesanan"
            />
          ) : (
            <p className="st-redup-teks">{loading ? "Memuat..." : "-"}</p>
          )}
        </section>
      </div>

      <div className="st-baris dua">
        <section className="st-panel">
          <div className="st-panel-kepala">
            <h2>Produk Paling Sering Dilihat</h2>
          </div>
          {!data || data.produk.length === 0 ? (
            <p className="st-redup-teks">{loading ? "Memuat..." : "Belum ada produk yang dilihat pada rentang ini."}</p>
          ) : (
            <ol className="st-produk">
              {data.produk.map((p, i) => {
                const info = produk[p.produk_id];
                return (
                  <li key={p.produk_id}>
                    <span className="st-peringkat">{i + 1}</span>
                    {info?.foto ? (
                      <img src={info.foto} alt="" className="st-foto" loading="lazy" />
                    ) : (
                      <span className="st-foto kosong"><Ikon nama="foto" ukuran={18} /></span>
                    )}
                    <span className="st-produk-teks">
                      {info && !info.terhapus ? (
                        <Link href={`/produk/${p.produk_id}`} target="_blank">{info.nama}</Link>
                      ) : (
                        <span>{info ? `${info.nama} (sudah dihapus)` : `Produk #${p.produk_id}`}</span>
                      )}
                      <small>Dilihat {angka(p.orang)} orang</small>
                    </span>
                    <strong className="st-produk-angka">{angka(p.dilihat)}<small>kali</small></strong>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <div className="st-tumpuk">
          <section className="st-panel">
            <div className="st-panel-kepala">
              <h2>Dari Mana Pengunjung Datang</h2>
            </div>
            {!data || data.sumber.length === 0 ? (
              <p className="st-redup-teks">{loading ? "Memuat..." : "Belum ada data."}</p>
            ) : (
              <div className="st-daftar-bb">
                {data.sumber.map((s) => (
                  <BarisBatang
                    key={s.sumber}
                    label={s.sumber === "langsung" ? "Langsung (ketik alamat / bookmark)" : s.sumber}
                    nilai={s.jumlah}
                    maks={maksSumber}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="st-panel">
            <div className="st-panel-kepala">
              <h2>Klik WhatsApp Berasal Dari</h2>
            </div>
            {!data || data.wa_dari.length === 0 ? (
              <p className="st-redup-teks">{loading ? "Memuat..." : "Belum ada klik WhatsApp."}</p>
            ) : (
              <div className="st-daftar-bb">
                {data.wa_dari.map((s) => (
                  <BarisBatang key={s.path} label={namaHalaman(s.path, namaProduk)} nilai={s.jumlah} maks={maksWA} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <section className="st-panel">
        <div className="st-panel-kepala">
          <h2>Halaman Paling Sering Dibuka</h2>
        </div>
        {!data || data.halaman.length === 0 ? (
          <p className="st-redup-teks">{loading ? "Memuat..." : "Belum ada data."}</p>
        ) : (
          <div className="st-daftar-bb dua-kolom">
            {data.halaman.map((h) => (
              <BarisBatang
                key={h.path}
                label={namaHalaman(h.path, namaProduk)}
                nilai={h.jumlah}
                maks={maksHalaman}
                sub={h.path}
                href={h.path}
              />
            ))}
          </div>
        )}
      </section>

      <style>{`
        .st-kepala { align-items: flex-start; gap: 16px; flex-wrap: wrap; }
        .st-rentang { display: flex; gap: 4px; padding: 4px; border: 1px solid #eadfce; border-radius: 12px; background: #fff; }
        .st-rentang button { height: 36px; padding: 0 14px; border: none; border-radius: 8px; background: transparent; color: #6f5a49; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer; }
        .st-rentang button:hover { background: #f8f1e8; }
        .st-rentang button.dipilih { background: #6f4c36; color: #fff; }
        .st-rentang .st-segarkan { width: 36px; padding: 0; display: grid; place-items: center; }
        .st-rentang .st-segarkan:disabled { opacity: .5; cursor: wait; }

        .st-pesan { margin-bottom: 16px; }
        .st-info { margin-bottom: 16px; padding: 12px 16px; border: 1px solid #f1d9a8; border-radius: 12px; background: #fffaf0; color: #6b4f1d; font-size: 14px; line-height: 1.6; }

        .st-kartu-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-bottom: 20px; }
        .st-kartu { display: flex; align-items: center; gap: 14px; padding: 16px 18px; border: 1px solid #eadfce; border-radius: 14px; background: #fff; color: #3f2f24; }
        .st-kartu-ikon { width: 46px; height: 46px; flex-shrink: 0; display: grid; place-items: center; border-radius: 12px; }
        .st-kartu-ikon.coklat { background: #f3e8da; color: #6f4c36; }
        .st-kartu-ikon.biru { background: #e6efff; color: #2f5fa3; }
        .st-kartu-ikon.hijau { background: #e3f6ea; color: #1f8f4c; }
        .st-kartu-ikon.kuning { background: #fdf0d8; color: #a8660f; }
        .st-kartu-teks { display: grid; gap: 2px; min-width: 0; }
        .st-kartu-teks strong { font-size: 24px; line-height: 1.1; }
        .st-kartu-teks span { font-size: 13.5px; color: #7d6957; }
        .st-kartu-teks small { font-size: 12px; color: #9a8571; }
        .st-redup { opacity: .55; }

        .st-baris { display: grid; gap: 20px; margin-bottom: 20px; }
        .st-baris.dua { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .st-tumpuk { display: grid; gap: 20px; align-content: start; }
        .st-panel { padding: 18px; background: #fff; border: 1px solid #eadfce; border-radius: 14px; min-width: 0; }
        .st-baris + .st-panel, .st-baris > .st-panel { margin: 0; }
        .st-panel-kepala { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 8px; }
        .st-panel-kepala h2 { margin: 0 !important; font-size: 17px !important; }
        .st-catatan { margin: 0 0 10px; font-size: 12.5px; color: #9a8571; }
        .st-redup-teks { margin: 8px 0; font-size: 14px; color: #7d6957; }

        .st-legenda { display: flex; gap: 14px; font-size: 12.5px; color: #7d6957; }
        .st-legenda span { display: inline-flex; align-items: center; gap: 6px; }
        .st-legenda i { display: inline-block; width: 12px; height: 12px; border-radius: 3px; }
        .st-legenda i.batang { background: #d9b98f; }
        .st-legenda i.garis { height: 3px; background: #2f5fa3; border-radius: 2px; }

        .st-tab { display: flex; gap: 4px; padding: 3px; border-radius: 10px; background: #f6efe6; }
        .st-tab button { height: 30px; padding: 0 10px; border: none; border-radius: 7px; background: transparent; color: #6f5a49; font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; }
        .st-tab button.dipilih { background: #fff; color: #3f2f24; box-shadow: 0 1px 3px rgba(59,42,32,.12); }

        .st-grafik { width: 100%; height: auto; display: block; }
        .st-garis-bantu { stroke: #f0e7db; stroke-width: 1; }
        .st-label-sumbu { font-size: 10.5px; fill: #9a8571; }
        .st-batang { fill: #d9b98f; }
        .st-batang:hover { fill: #c58a2b; }
        .st-garis { fill: none; stroke: #2f5fa3; stroke-width: 2; stroke-linejoin: round; }

        .st-produk { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; }
        .st-produk li { display: flex; align-items: center; gap: 12px; padding: 8px 6px; border-radius: 10px; }
        .st-produk li:hover { background: #fcf8f2; }
        .st-peringkat { width: 24px; flex-shrink: 0; text-align: center; font-weight: 800; color: #b9a48e; }
        .st-produk li:nth-child(-n+3) .st-peringkat { color: #c58a2b; }
        .st-foto { width: 44px; height: 44px; flex-shrink: 0; border-radius: 8px; object-fit: cover; background: #f3eadf; }
        .st-foto.kosong { display: grid; place-items: center; color: #b9a48e; border: 1px dashed #d6c1a8; background: #fcfaf7; }
        .st-produk-teks { display: grid; gap: 1px; min-width: 0; flex: 1; }
        .st-produk-teks a, .st-produk-teks > span { color: #3f2f24; font-weight: 600; font-size: 14px; text-decoration: none; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .st-produk-teks a:hover { text-decoration: underline; }
        .st-produk-teks small { font-size: 12.5px; color: #9a8571; }
        .st-produk-angka { display: grid; justify-items: end; font-size: 16px; color: #3f2f24; }
        .st-produk-angka small { font-size: 11.5px; font-weight: 500; color: #9a8571; }

        .st-daftar-bb { display: grid; gap: 12px; }
        .st-daftar-bb.dua-kolom { grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 28px; }
        .st-bb { display: grid; gap: 5px; color: inherit; text-decoration: none; min-width: 0; }
        a.st-bb:hover .st-bb-label { text-decoration: underline; }
        .st-bb-atas { display: flex; justify-content: space-between; gap: 10px; font-size: 14px; }
        .st-bb-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #3f2f24; }
        .st-bb-jalur { display: block; height: 8px; border-radius: 999px; background: #f3eadf; overflow: hidden; }
        .st-bb-jalur span { display: block; height: 100%; border-radius: 999px; background: #c9a274; }
        .st-bb-sub { font-size: 11.5px; color: #b9a48e; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        @media (max-width: 1100px) {
          .st-baris.dua { grid-template-columns: minmax(0, 1fr); }
        }
        @media (max-width: 900px) {
          .st-kartu-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .st-daftar-bb.dua-kolom { grid-template-columns: minmax(0, 1fr); }
        }
        @media (max-width: 520px) {
          .st-rentang { width: 100%; }
          .st-rentang button { flex: 1; padding: 0 6px; }
          .st-rentang .st-segarkan { flex: 0 0 36px; }
          .st-kartu { padding: 12px; gap: 10px; }
          .st-kartu-ikon { width: 38px; height: 38px; }
          .st-kartu-teks strong { font-size: 20px; }
          .st-panel { padding: 14px; }
        }
      `}</style>
    </main>
  );
}
