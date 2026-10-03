"use client";

// Lokasi file: app/admin/pesanan/page.js
// Pesanan: kartu ringkasan per status, filter (cari, status, cabang, tanggal),
// urutkan kolom, halaman 1 2 3, dan panel detail di sebelah kanan
// (WhatsApp + tombol ubah status) tanpa pindah halaman.

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "../../../lib/supabase";
import Paginasi from "../Paginasi";
import { KolomUrut } from "../Urut";

const PILIHAN_PER_HALAMAN = [10, 25, 50];

const KOLOM_URUT = {
  nomor: "nomor_pesanan",
  tanggal: "created_at",
  total: "total",
  status: "status",
};

const STATUS = {
  baru: { label: "Baru", kelas: "baru" },
  diproses: { label: "Diproses", kelas: "diproses" },
  selesai: { label: "Selesai", kelas: "selesai" },
  dibatalkan: { label: "Dibatalkan", kelas: "dibatalkan" },
};

function labelStatus(s) {
  if (STATUS[s]) return STATUS[s].label;
  if (!s) return "-";
  return String(s).split("_").map((k) => k.charAt(0).toUpperCase() + k.slice(1)).join(" ");
}

function kelasStatus(s) {
  return STATUS[s] ? STATUS[s].kelas : "lainnya";
}

function formatRupiah(n) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);
}

function formatTanggal(v) {
  if (!v) return "-";
  const t = new Date(v);
  return {
    tgl: t.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
    jam: t.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
  };
}

function nomorWA(nomor) {
  let d = String(nomor || "").replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("0")) d = "62" + d.slice(1);
  if (d.startsWith("8")) d = "62" + d;
  return d;
}

function awalRentang(kode) {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  if (kode === "hari_ini") return t.toISOString();
  if (kode === "7_hari") { t.setDate(t.getDate() - 6); return t.toISOString(); }
  if (kode === "30_hari") { t.setDate(t.getDate() - 29); return t.toISOString(); }
  return null;
}

function IkonStatus({ nama }) {
  const isi = {
    baru: <><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M2 3h3l2.7 12.4a1 1 0 0 0 1 .8h9.6a1 1 0 0 0 1-.8L21 7H6" /></>,
    diproses: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    selesai: <><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>,
    dibatalkan: <><circle cx="12" cy="12" r="9" /><path d="m9 9 6 6M15 9l-6 6" /></>,
  }[nama];
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {isi}
    </svg>
  );
}

function IkonWA() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.8-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.1 5.1 0 0 0 1.1 2.7 11.7 11.7 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.4-.3Z" />
    </svg>
  );
}

// ================= PANEL DETAIL =================
function PanelDetail({ id, onTutup, onBerubah }) {
  const [pesanan, setPesanan] = useState(null);
  const [item, setItem] = useState([]);
  const [memuat, setMemuat] = useState(true);
  const [proses, setProses] = useState(false);
  const [pesan, setPesan] = useState(null);

  const muat = useCallback(async () => {
    setMemuat(true);
    setPesan(null);
    const supabase = getSupabase();
    const [{ data: p }, { data: d }] = await Promise.all([
      supabase
        .from("pesanan")
        .select(
          "id, created_at, nomor_pesanan, status, total, catatan, whatsapp, deleted_at, pelanggan:pelanggan_id ( nama, telepon, email, tipe, alamat ), cabang:cabang_id ( nama, alamat )"
        )
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("detail_pesanan")
        .select("id, nama_produk, harga, jumlah, subtotal, mode_harga, harga_min, harga_max, catatan")
        .eq("pesanan_id", id)
        .order("id", { ascending: true }),
    ]);
    setPesanan(p || null);
    setItem(d || []);
    setMemuat(false);
  }, [id]);

  useEffect(() => {
    muat();
  }, [muat]);

  async function ubahStatus(statusBaru) {
    if (statusBaru === "dibatalkan" && !window.confirm("Batalkan pesanan ini?\n\nPesanan berubah menjadi Dibatalkan dan tetap tersimpan dalam riwayat.")) return;

    setProses(true);
    setPesan(null);
    let q = getSupabase().from("pesanan").update({ status: statusBaru }).eq("id", id);
    if (statusBaru === "diproses") q = q.eq("status", "baru");
    if (statusBaru === "selesai") q = q.eq("status", "diproses");
    if (statusBaru === "dibatalkan") q = q.in("status", ["baru", "diproses"]);
    const { data, error } = await q.select("id");
    setProses(false);

    if (error || !data || data.length === 0) {
      setPesan({ jenis: "gagal", teks: error ? error.message : "Status tidak dapat diubah. Kemungkinan status sudah berubah." });
      return;
    }
    setPesan({ jenis: "sukses", teks: `Pesanan ditandai ${labelStatus(statusBaru)}.` });
    setPesanan((p) => ({ ...p, status: statusBaru }));
    onBerubah();
  }

  async function keTrash() {
    if (!window.confirm("Pindahkan pesanan ini ke Trash?\n\nPesanan masih bisa dipulihkan dari Trash Pesanan.")) return;
    setProses(true);
    const { error } = await getSupabase()
      .from("pesanan")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .eq("status", "dibatalkan")
      .is("deleted_at", null);
    setProses(false);
    if (error) {
      setPesan({ jenis: "gagal", teks: error.message });
      return;
    }
    onBerubah();
    onTutup();
  }

  function bukaWA() {
    const nomor = nomorWA(pesanan?.whatsapp || pesanan?.pelanggan?.telepon);
    if (!nomor) {
      window.alert("Nomor WhatsApp pelanggan tidak tersedia.");
      return;
    }
    const nama = pesanan?.pelanggan?.nama || "Pelanggan";
    const no = pesanan?.nomor_pesanan || `#${pesanan?.id}`;
    const teks = `Halo ${nama}, kami dari Toko Listrik Sinar Kasih. Kami menghubungi terkait pesanan ${no}.`;
    window.open(`https://wa.me/${nomor}?text=${encodeURIComponent(teks)}`, "_blank");
  }

  function hargaItem(it) {
    if (it.mode_harga === "range") return `${formatRupiah(it.harga_min)} – ${formatRupiah(it.harga_max)}`;
    if (it.mode_harga === "hubungi") return "Harga dikonfirmasi";
    return formatRupiah(it.harga);
  }

  const t = pesanan ? formatTanggal(pesanan.created_at) : null;

  return (
    <aside className="ps-panel" aria-label="Detail pesanan">
      <div className="ps-panel-kepala">
        <h2>Detail Pesanan</h2>
        <button type="button" className="ps-tutup" onClick={onTutup} aria-label="Tutup detail">
          ×
        </button>
      </div>

      {memuat ? (
        <p className="ps-redup-teks">Memuat detail...</p>
      ) : !pesanan ? (
        <p className="ps-redup-teks">Pesanan tidak ditemukan.</p>
      ) : (
        <div className="ps-panel-isi">
          <div className="ps-ringkas-atas">
            <div>
              <strong className="ps-no">{pesanan.nomor_pesanan || `#${pesanan.id}`}</strong>
              <span className="ps-waktu">{t.tgl}, {t.jam}</span>
            </div>
            <span className={`ps-status ${kelasStatus(pesanan.status)}`}>{labelStatus(pesanan.status)}</span>
          </div>

          <button type="button" className="ps-wa" onClick={bukaWA}>
            <IkonWA /> Chat WhatsApp
          </button>

          {pesan && <div className={`ps-pesan ${pesan.jenis}`}>{pesan.teks}</div>}

          <section className="ps-blok">
            <h3>Pelanggan</h3>
            <p className="ps-tebal">{pesanan.pelanggan?.nama || "-"}</p>
            <p>{pesanan.whatsapp || pesanan.pelanggan?.telepon || "-"}</p>
            {pesanan.pelanggan?.alamat && <p className="ps-redup-teks">{pesanan.pelanggan.alamat}</p>}
            <p className="ps-redup-teks">
              {pesanan.pelanggan?.tipe === "guest" ? "Tanpa akun (Guest)" : pesanan.pelanggan?.tipe ? "Pelanggan terdaftar" : ""}
            </p>
          </section>

          <section className="ps-blok">
            <h3>Cabang Tujuan</h3>
            <p className="ps-tebal">{pesanan.cabang?.nama || "-"}</p>
            {pesanan.cabang?.alamat && <p className="ps-redup-teks">{pesanan.cabang.alamat}</p>}
          </section>

          <section className="ps-blok">
            <h3>Daftar Produk</h3>
            <ul className="ps-item">
              {item.map((it) => (
                <li key={it.id}>
                  <div>
                    <span className="ps-tebal">{it.nama_produk}</span>
                    <span className="ps-redup-teks">{it.jumlah} × {hargaItem(it)}</span>
                    {it.catatan && <span className="ps-redup-teks">Catatan: {it.catatan}</span>}
                  </div>
                  <span className="ps-tebal">{it.mode_harga === "hubungi" ? "-" : formatRupiah(it.subtotal)}</span>
                </li>
              ))}
            </ul>
            <div className="ps-total">
              <span>Total</span>
              <strong>{formatRupiah(pesanan.total)}</strong>
            </div>
          </section>

          {pesanan.catatan && (
            <section className="ps-blok">
              <h3>Catatan Pelanggan</h3>
              <p className="ps-catatan">{pesanan.catatan}</p>
            </section>
          )}

          <div className="ps-aksi">
            {pesanan.status === "baru" && (
              <button type="button" className="ps-btn hijau" disabled={proses} onClick={() => ubahStatus("diproses")}>
                Tandai Diproses
              </button>
            )}
            {pesanan.status === "diproses" && (
              <button type="button" className="ps-btn utama" disabled={proses} onClick={() => ubahStatus("selesai")}>
                Tandai Selesai
              </button>
            )}
            {(pesanan.status === "baru" || pesanan.status === "diproses") && (
              <button type="button" className="ps-btn bahaya" disabled={proses} onClick={() => ubahStatus("dibatalkan")}>
                Batalkan Pesanan
              </button>
            )}
            {pesanan.status === "dibatalkan" && !pesanan.deleted_at && (
              <button type="button" className="ps-btn bahaya" disabled={proses} onClick={keTrash}>
                Pindahkan ke Trash
              </button>
            )}
            <Link href={`/admin/pesanan/${pesanan.id}`} className="ps-btn">
              Buka halaman lengkap
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}

// ================= HALAMAN =================
export default function AdminPesananPage() {
  const [pesanan, setPesanan] = useState([]);
  const [jumlahItem, setJumlahItem] = useState({});
  const [total, setTotal] = useState(0);
  const [ringkas, setRingkas] = useState(null);
  const [cabang, setCabang] = useState([]);

  const [halaman, setHalaman] = useState(1);
  const [perHalaman, setPerHalaman] = useState(25);
  const [ketik, setKetik] = useState("");
  const [cari, setCari] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCabang, setFilterCabang] = useState("");
  const [filterTanggal, setFilterTanggal] = useState("");
  const [urutan, setUrutan] = useState({ kunci: null, arah: "asc" });

  const [dipilih, setDipilih] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const urut = {
    kunci: urutan.kunci,
    arah: urutan.arah,
    ganti: (kunci) => {
      setUrutan((u) => {
        if (u.kunci !== kunci) return { kunci, arah: "asc" };
        if (u.arah === "asc") return { kunci, arah: "desc" };
        return { kunci: null, arah: "asc" };
      });
      setHalaman(1);
    },
  };

  useEffect(() => {
    const t = setTimeout(() => {
      setCari(ketik.trim());
      setHalaman(1);
    }, 400);
    return () => clearTimeout(t);
  }, [ketik]);

  const muatRingkasan = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    const hitung = (status) =>
      supabase
        .from("pesanan")
        .select("id", { count: "exact", head: true })
        .is("deleted_at", null)
        .eq("status", status);
    const [b, p, s, d, cb] = await Promise.all([
      hitung("baru"),
      hitung("diproses"),
      hitung("selesai"),
      hitung("dibatalkan"),
      supabase.from("cabang_toko").select("id, nama").order("nama"),
    ]);
    setRingkas({ baru: b.count ?? 0, diproses: p.count ?? 0, selesai: s.count ?? 0, dibatalkan: d.count ?? 0 });
    setCabang(cb.data || []);
  }, []);

  useEffect(() => {
    muatRingkasan();
  }, [muatRingkasan]);

  const muatPesanan = useCallback(async () => {
    setLoading(true);
    setError("");
    const supabase = getSupabase();
    if (!supabase) {
      setError("Koneksi database belum tersedia.");
      setLoading(false);
      return;
    }

    const dari = (halaman - 1) * perHalaman;
    let q = supabase
      .from("pesanan")
      .select(
        "id, created_at, nomor_pesanan, status, total, whatsapp, pelanggan:pelanggan_id ( nama, telepon ), cabang:cabang_id ( nama )",
        { count: "exact" }
      )
      .is("deleted_at", null);

    if (cari) {
      const kata = cari.replace(/[,()%*]/g, " ").trim();
      if (kata) q = q.or(`nomor_pesanan.ilike.%${kata}%,whatsapp.ilike.%${kata}%`);
    }
    if (filterStatus) q = q.eq("status", filterStatus);
    if (filterCabang) q = q.eq("cabang_id", filterCabang);
    const awal = awalRentang(filterTanggal);
    if (awal) q = q.gte("created_at", awal);

    if (urutan.kunci) {
      q = q.order(KOLOM_URUT[urutan.kunci], { ascending: urutan.arah === "asc", nullsFirst: false });
    }
    q = q.order("created_at", { ascending: false }).range(dari, dari + perHalaman - 1);

    const { data, count, error: gagal } = await q;
    if (gagal) {
      setError(gagal.message);
      setLoading(false);
      return;
    }

    setPesanan(data || []);
    setTotal(count || 0);

    const ids = (data || []).map((x) => x.id);
    if (ids.length > 0) {
      const { data: det } = await supabase
        .from("detail_pesanan")
        .select("pesanan_id, jumlah")
        .in("pesanan_id", ids);
      const peta = {};
      (det || []).forEach((d) => {
        peta[d.pesanan_id] = (peta[d.pesanan_id] || 0) + (Number(d.jumlah) || 0);
      });
      setJumlahItem(peta);
    } else {
      setJumlahItem({});
    }
    setLoading(false);
  }, [halaman, perHalaman, cari, filterStatus, filterCabang, filterTanggal, urutan]);

  useEffect(() => {
    muatPesanan();
  }, [muatPesanan]);

  function resetFilter() {
    setKetik("");
    setCari("");
    setFilterStatus("");
    setFilterCabang("");
    setFilterTanggal("");
    setUrutan({ kunci: null, arah: "asc" });
    setHalaman(1);
  }

  function bukaWA(e, p) {
    e.stopPropagation();
    const nomor = nomorWA(p.whatsapp || p.pelanggan?.telepon);
    if (!nomor) {
      window.alert("Nomor WhatsApp pelanggan tidak tersedia.");
      return;
    }
    const teks = `Halo ${p.pelanggan?.nama || "Pelanggan"}, kami dari Toko Listrik Sinar Kasih. Kami menghubungi terkait pesanan ${p.nomor_pesanan || "#" + p.id}.`;
    window.open(`https://wa.me/${nomor}?text=${encodeURIComponent(teks)}`, "_blank");
  }

  const totalHalaman = Math.max(1, Math.ceil(total / perHalaman));
  const adaFilter = ketik || filterStatus || filterCabang || filterTanggal || urutan.kunci;

  const kartu = [
    { kunci: "baru", label: "Pesanan Baru" },
    { kunci: "diproses", label: "Diproses" },
    { kunci: "selesai", label: "Selesai" },
    { kunci: "dibatalkan", label: "Dibatalkan" },
  ];

  return (
    <main className="admin-content">
      <div className="admin-page-header">
        <div>
          <h1>Pesanan</h1>
          <p>Kelola pesanan pelanggan. Klik satu pesanan untuk melihat detail dan mengubah statusnya.</p>
        </div>
        <Link href="/admin/pesanan/trash" className="admin-secondary-button">
          Trash Pesanan
        </Link>
      </div>

      <div className="ps-kartu-grid">
        {kartu.map((k) => (
          <button
            key={k.kunci}
            type="button"
            className={`ps-kartu ${k.kunci} ${filterStatus === k.kunci ? "dipilih" : ""}`}
            onClick={() => {
              setFilterStatus(filterStatus === k.kunci ? "" : k.kunci);
              setHalaman(1);
            }}
          >
            <span className="ps-kartu-ikon"><IkonStatus nama={k.kunci} /></span>
            <span className="ps-kartu-teks">
              <strong>{ringkas ? ringkas[k.kunci] : "–"}</strong>
              <span>{k.label}</span>
            </span>
          </button>
        ))}
      </div>

      <div className={`ps-tata ${dipilih ? "ada-panel" : ""}`}>
        <div className="admin-product-table-card ps-daftar">
          <div className="ps-filter">
            <div className="cari-x-wrap">
              <input
                type="text"
                placeholder="Cari nomor pesanan atau nomor WhatsApp..."
                value={ketik}
                onChange={(e) => setKetik(e.target.value)}
              />
              {ketik !== "" && (
                <button type="button" className="cari-x" onClick={() => setKetik("")} aria-label="Hapus pencarian" title="Hapus pencarian">
                  ×
                </button>
              )}
            </div>

            <select value={filterTanggal} onChange={(e) => { setFilterTanggal(e.target.value); setHalaman(1); }}>
              <option value="">Semua Tanggal</option>
              <option value="hari_ini">Hari Ini</option>
              <option value="7_hari">7 Hari Terakhir</option>
              <option value="30_hari">30 Hari Terakhir</option>
            </select>

            <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setHalaman(1); }}>
              <option value="">Semua Status</option>
              <option value="baru">Baru</option>
              <option value="diproses">Diproses</option>
              <option value="selesai">Selesai</option>
              <option value="dibatalkan">Dibatalkan</option>
            </select>

            <select value={filterCabang} onChange={(e) => { setFilterCabang(e.target.value); setHalaman(1); }}>
              <option value="">Semua Cabang</option>
              {cabang.map((c) => (
                <option key={c.id} value={c.id}>{c.nama}</option>
              ))}
            </select>

            <button type="button" className="ps-reset" onClick={resetFilter} disabled={!adaFilter}>
              Reset
            </button>
          </div>

          {error && <div className="admin-message admin-message-error ps-err">{error}</div>}

          {!loading && pesanan.length === 0 ? (
            <div className="ps-kosong">
              <h2>{adaFilter ? "Pesanan tidak ditemukan" : "Belum ada pesanan"}</h2>
              <p>{adaFilter ? "Coba ubah pencarian atau filter." : "Pesanan dari website akan muncul di sini."}</p>
            </div>
          ) : (
            <div className="admin-product-table-wrapper">
              <table>
                <thead>
                  <tr>
                    <KolomUrut urut={urut} kunci="nomor">No. Pesanan</KolomUrut>
                    <KolomUrut urut={urut} kunci="tanggal">Tanggal</KolomUrut>
                    <th>Pelanggan</th>
                    <th className="ps-sembunyi-panel">Jumlah</th>
                    <KolomUrut urut={urut} kunci="total">Total</KolomUrut>
                    <th className="ps-sembunyi-panel">Cabang</th>
                    <KolomUrut urut={urut} kunci="status">Status</KolomUrut>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody className={loading ? "ps-redup" : ""}>
                  {pesanan.map((p) => {
                    const t = formatTanggal(p.created_at);
                    return (
                      <tr
                        key={p.id}
                        className={`ps-baris ${dipilih === p.id ? "aktif" : ""}`}
                        onClick={() => setDipilih(p.id)}
                      >
                        <td className="ps-no-sel">{p.nomor_pesanan || `#${p.id}`}</td>
                        <td>
                          <span className="ps-tgl">{t.tgl}</span>
                          <span className="ps-jam">{t.jam}</span>
                        </td>
                        <td>
                          <span className="ps-nama">{p.pelanggan?.nama || "-"}</span>
                          <span className="ps-jam">{p.whatsapp || p.pelanggan?.telepon || ""}</span>
                        </td>
                        <td className="ps-sembunyi-panel">{jumlahItem[p.id] ?? "-"} item</td>
                        <td className="ps-uang">{formatRupiah(p.total)}</td>
                        <td className="ps-sembunyi-panel">{p.cabang?.nama || "-"}</td>
                        <td>
                          <span className={`ps-status ${kelasStatus(p.status)}`}>{labelStatus(p.status)}</span>
                        </td>
                        <td>
                          <div className="ps-aksi-baris">
                            <button type="button" className="ps-ikon wa" onClick={(e) => bukaWA(e, p)} title="Chat WhatsApp" aria-label="Chat WhatsApp">
                              <IkonWA />
                            </button>
                            <button
                              type="button"
                              className="ps-ikon"
                              onClick={(e) => { e.stopPropagation(); setDipilih(p.id); }}
                              title="Lihat detail"
                              aria-label="Lihat detail"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="ps-bawah">
            <label className="ps-per">
              Tampilkan
              <select value={perHalaman} onChange={(e) => { setPerHalaman(Number(e.target.value)); setHalaman(1); }}>
                {PILIHAN_PER_HALAMAN.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              per halaman
            </label>
            <div className="ps-paginasi">
              <Paginasi halaman={halaman} totalHalaman={totalHalaman} totalData={total} perHalaman={perHalaman} onGanti={setHalaman} satuan="pesanan" />
            </div>
          </div>
        </div>

        {dipilih && (
          <>
            <div className="ps-latar" onClick={() => setDipilih(null)} />
            <PanelDetail
              key={dipilih}
              id={dipilih}
              onTutup={() => setDipilih(null)}
              onBerubah={() => {
                muatPesanan();
                muatRingkasan();
              }}
            />
          </>
        )}
      </div>

      <style>{`
        .ps-kartu-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-bottom: 20px; }
        .ps-kartu { display: flex; align-items: center; gap: 14px; padding: 16px 18px; border: 1px solid #eadfce; border-radius: 14px; background: #fff; text-align: left; cursor: pointer; font: inherit; color: #3f2f24; transition: border-color .15s ease, box-shadow .15s ease; }
        .ps-kartu:hover { border-color: #d6c1a8; box-shadow: 0 4px 14px rgba(59,42,32,.06); }
        .ps-kartu.dipilih { border-color: #6f4c36; box-shadow: 0 0 0 2px rgba(111,76,54,.15); }
        .ps-kartu-ikon { width: 46px; height: 46px; flex-shrink: 0; display: grid; place-items: center; border-radius: 12px; }
        .ps-kartu.baru .ps-kartu-ikon { background: #fdf0d8; color: #a8660f; }
        .ps-kartu.diproses .ps-kartu-ikon { background: #e6efff; color: #2f5fa3; }
        .ps-kartu.selesai .ps-kartu-ikon { background: #e4f5e9; color: #2f7a46; }
        .ps-kartu.dibatalkan .ps-kartu-ikon { background: #fbe9e7; color: #b23b2e; }
        .ps-kartu-teks { display: grid; gap: 2px; }
        .ps-kartu-teks strong { font-size: 24px; line-height: 1.1; }
        .ps-kartu-teks span { font-size: 13.5px; color: #7d6957; }

        .ps-tata { display: grid; grid-template-columns: minmax(0, 1fr); gap: 20px; align-items: start; }
        .ps-tata.ada-panel { grid-template-columns: minmax(0, 1fr) 380px; }
        .ps-tata.ada-panel .ps-sembunyi-panel { display: none; }
        .ps-daftar { min-width: 0; }

        .ps-filter { display: grid; grid-template-columns: minmax(220px, 2fr) repeat(3, minmax(130px, 1fr)) auto; gap: 10px; padding: 16px; border-bottom: 1px solid #f0e7db; }
        .ps-tata.ada-panel .ps-filter { grid-template-columns: 1fr 1fr; }
        .ps-tata.ada-panel .ps-filter .cari-x-wrap { grid-column: 1 / -1; }
        .ps-filter select, .ps-filter input { height: 44px; }
        .ps-filter select { padding: 0 12px; }
        .ps-reset { height: 44px; padding: 0 16px; border: 1px solid #e0cfbb; border-radius: 10px; background: #fff; color: #5c3e2c; font-weight: 600; cursor: pointer; }
        .ps-reset:disabled { opacity: .45; cursor: default; }
        .ps-err { margin: 14px 16px 0; }

        .ps-daftar table th, .ps-daftar table td { padding: 12px 14px; border-bottom: 1px solid #f0e7db; }
        .ps-baris { cursor: pointer; transition: background .12s ease; }
        .ps-baris:hover { background: #fcf8f2; }
        .ps-baris.aktif { background: #f8efe3; }
        .ps-no-sel { font-weight: 700; white-space: nowrap; }
        .ps-tgl, .ps-nama { display: block; white-space: nowrap; }
        .ps-nama { font-weight: 600; }
        .ps-jam { display: block; font-size: 12.5px; color: #9a8571; }
        .ps-uang { font-weight: 700; white-space: nowrap; }

        .ps-status { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; white-space: nowrap; }
        .ps-status.baru { background: #fff3d9; color: #8a641d; }
        .ps-status.diproses { background: #eaf2ff; color: #315d91; }
        .ps-status.selesai { background: #eaf7ed; color: #347045; }
        .ps-status.dibatalkan { background: #fbecec; color: #943f3f; }
        .ps-status.lainnya { background: #fdf0e1; color: #9a5b16; }

        .ps-aksi-baris { display: flex; gap: 6px; }
        .ps-ikon { width: 34px; height: 34px; display: grid; place-items: center; border: 1px solid #e0cfbb; border-radius: 8px; background: #fff; color: #4b3326; cursor: pointer; }
        .ps-ikon:hover { background: #f8f1e8; }
        .ps-ikon.wa { background: #25d366; border-color: #25d366; color: #fff; }
        .ps-ikon.wa:hover { background: #1fb457; }

        .ps-redup { opacity: .5; }
        .ps-kosong { padding: 40px 20px; text-align: center; }
        .ps-kosong p { margin: 0; color: #7d6957; }

        .ps-bawah { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; padding: 4px 16px 16px; }
        .ps-per { display: flex; align-items: center; gap: 8px; font-size: 13.5px; color: #7d6957; margin-top: 18px; }
        .ps-per select { height: 36px; padding: 0 8px; }
        .ps-paginasi { flex: 1; min-width: 260px; }

        /* Panel detail */
        .ps-panel { position: sticky; top: 0; max-height: calc(100vh - 120px); overflow-y: auto; background: #fff; border: 1px solid #eadfce; border-radius: 14px; box-shadow: 0 8px 24px rgba(59,42,32,.08); }
        .ps-latar { display: none; }
        .ps-panel-kepala { position: sticky; top: 0; z-index: 2; display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; background: #fff; border-bottom: 1px solid #f0e7db; }
        .ps-panel-kepala h2 { margin: 0 !important; font-size: 17px !important; }
        .ps-tutup { width: 32px; height: 32px; border: none; border-radius: 8px; background: #f3eadf; color: #4b3326; font-size: 22px; line-height: 1; cursor: pointer; }
        .ps-panel-isi { padding: 16px 18px 20px; display: grid; gap: 14px; }
        .ps-ringkas-atas { display: flex; justify-content: space-between; gap: 10px; align-items: flex-start; }
        .ps-no { display: block; font-size: 16px; }
        .ps-waktu { display: block; font-size: 12.5px; color: #9a8571; margin-top: 2px; }
        .ps-wa { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 42px; border: none; border-radius: 10px; background: #25d366; color: #fff; font-weight: 700; font-size: 14.5px; cursor: pointer; }
        .ps-wa:hover { background: #1fb457; }
        .ps-pesan { padding: 10px 12px; border-radius: 10px; font-size: 13.5px; }
        .ps-pesan.gagal { background: #fbebe7; color: #8a3b2b; }
        .ps-pesan.sukses { background: #eaf7ed; color: #2f6b3f; }
        .ps-blok { padding: 14px; border: 1px solid #f0e7db; border-radius: 12px; background: #fcfaf7; }
        .ps-blok h3 { margin: 0 0 8px !important; font-size: 13px !important; color: #9a8571 !important; text-transform: uppercase; letter-spacing: .03em; }
        .ps-blok p { margin: 2px 0; font-size: 14px; }
        .ps-tebal { font-weight: 700; }
        .ps-redup-teks { display: block; font-size: 13px; color: #7d6957; }
        .ps-panel > .ps-redup-teks { padding: 18px; }
        .ps-item { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
        .ps-item li { display: flex; justify-content: space-between; gap: 10px; font-size: 14px; }
        .ps-item li > div { display: grid; gap: 1px; min-width: 0; }
        .ps-total { display: flex; justify-content: space-between; margin-top: 12px; padding-top: 10px; border-top: 1px dashed #e0cfbb; font-size: 15px; }
        .ps-catatan { padding: 10px 12px; border-radius: 8px; background: #fff8e8; }
        .ps-aksi { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .ps-btn { display: inline-flex; align-items: center; justify-content: center; min-height: 42px; padding: 0 12px; border: 1px solid #e0cfbb; border-radius: 10px; background: #fff; color: #4b3326; font-weight: 700; font-size: 14px; text-decoration: none; cursor: pointer; }
        .ps-btn:hover { background: #f8f1e8; }
        .ps-btn.hijau { background: #2f9e57; border-color: #2f9e57; color: #fff; }
        .ps-btn.utama { background: #6f4c36; border-color: #6f4c36; color: #fff; }
        .ps-btn.bahaya { background: #fbebe7; border-color: #efc7bc; color: #a33a2c; }
        .ps-btn:disabled { opacity: .6; cursor: wait; }
        .ps-aksi > a.ps-btn:last-child { grid-column: 1 / -1; }

        @media (max-width: 1200px) {
          .ps-tata.ada-panel { grid-template-columns: minmax(0, 1fr); }
          .ps-tata.ada-panel .ps-sembunyi-panel { display: table-cell; }
          .ps-latar { display: block; position: fixed; inset: 0; z-index: 1003; background: rgba(30,20,14,.45); }
          .ps-panel { position: fixed; top: 0; right: 0; bottom: 0; z-index: 1004; width: min(420px, 100%); max-height: none; border-radius: 0; }
        }

        @media (max-width: 1100px) {
          .ps-filter { grid-template-columns: 1fr 1fr; }
          .ps-filter .cari-x-wrap { grid-column: 1 / -1; }
        }

        @media (max-width: 900px) {
          .ps-kartu-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }

        @media (max-width: 520px) {
          .ps-filter { grid-template-columns: 1fr; }
          .ps-kartu { padding: 12px; gap: 10px; }
          .ps-kartu-ikon { width: 38px; height: 38px; }
          .ps-kartu-teks strong { font-size: 20px; }
        }
      `}</style>
    </main>
  );
}
