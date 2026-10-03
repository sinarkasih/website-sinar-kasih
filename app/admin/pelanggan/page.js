"use client";

// Lokasi file: app/admin/pelanggan/page.js
// Pelanggan: kartu ringkasan (bisa diklik sebagai filter), filter (cari, status, tipe),
// urutkan kolom, halaman 1 2 3, jumlah pesanan & total belanja per pelanggan,
// dan panel detail di sebelah kanan (WhatsApp, riwayat pesanan, aktif/nonaktif)
// tanpa pindah halaman. Gaya sama dengan halaman Pesanan.

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "../../../lib/supabase";
import Paginasi from "../Paginasi";
import { KolomUrut } from "../Urut";

const PILIHAN_PER_HALAMAN = [10, 25, 50];

const KOLOM_URUT = {
  nama: "nama",
  bergabung: "created_at",
  status: "aktif",
};

const STATUS_PESANAN = {
  baru: "Baru",
  diproses: "Diproses",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

function labelStatusPesanan(s) {
  if (STATUS_PESANAN[s]) return STATUS_PESANAN[s];
  if (!s) return "-";
  return String(s).split("_").map((k) => k.charAt(0).toUpperCase() + k.slice(1)).join(" ");
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
  return new Date(v).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function nomorWA(nomor) {
  let d = String(nomor || "").replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("0")) d = "62" + d.slice(1);
  if (d.startsWith("8")) d = "62" + d;
  return d;
}

function labelTipe(t) {
  if (t === "guest") return "Guest";
  if (t === "terdaftar" || t === "registered") return "Terdaftar";
  return t || "-";
}

function awal30Hari() {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  t.setDate(t.getDate() - 29);
  return t.toISOString();
}

function Ikon({ nama }) {
  const isi = {
    semua: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6" /></>,
    aktif: <><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>,
    nonaktif: <><circle cx="12" cy="12" r="9" /><path d="M8 12h8" /></>,
    baru: <><circle cx="10" cy="8" r="3.5" /><path d="M3.5 20a6.5 6.5 0 0 1 11-4.7" /><path d="M18 14v6M15 17h6" /></>,
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

function bukaWhatsApp(nomorAsli, nama) {
  const nomor = nomorWA(nomorAsli);
  if (!nomor) {
    window.alert("Nomor WhatsApp pelanggan tidak tersedia.");
    return;
  }
  const teks = `Halo ${nama || "Bapak/Ibu"}, kami dari Toko Listrik Sinar Kasih.`;
  window.open(`https://wa.me/${nomor}?text=${encodeURIComponent(teks)}`, "_blank");
}

// ================= PANEL DETAIL =================
function PanelDetail({ id, onTutup, onBerubah }) {
  const [pelanggan, setPelanggan] = useState(null);
  const [pesanan, setPesanan] = useState([]);
  const [memuat, setMemuat] = useState(true);
  const [proses, setProses] = useState(false);
  const [pesan, setPesan] = useState(null);

  const muat = useCallback(async () => {
    setMemuat(true);
    setPesan(null);
    const supabase = getSupabase();
    const [{ data: p }, { data: ps }] = await Promise.all([
      supabase
        .from("pelanggan")
        .select("id, created_at, nama, email, telepon, tipe, alamat, aktif")
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("pesanan")
        .select("id, created_at, nomor_pesanan, status, total, cabang:cabang_id ( nama )")
        .eq("pelanggan_id", id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
    ]);
    setPelanggan(p || null);
    setPesanan(ps || []);
    setMemuat(false);
  }, [id]);

  useEffect(() => {
    muat();
  }, [muat]);

  async function ubahAktif() {
    const statusBaru = !pelanggan.aktif;
    const yakin = window.confirm(
      statusBaru
        ? `Aktifkan kembali pelanggan "${pelanggan.nama}"?`
        : `Nonaktifkan pelanggan "${pelanggan.nama}"?\n\nData dan riwayat pesanannya tetap tersimpan.`
    );
    if (!yakin) return;

    setProses(true);
    setPesan(null);
    const { error } = await getSupabase().from("pelanggan").update({ aktif: statusBaru }).eq("id", id);
    setProses(false);

    if (error) {
      setPesan({ jenis: "gagal", teks: error.message });
      return;
    }
    setPelanggan((x) => ({ ...x, aktif: statusBaru }));
    setPesan({ jenis: "sukses", teks: statusBaru ? "Pelanggan diaktifkan kembali." : "Pelanggan dinonaktifkan." });
    onBerubah();
  }

  const selesai = pesanan.filter((x) => x.status === "selesai");
  const berjalan = pesanan.filter((x) => x.status === "baru" || x.status === "diproses");
  const totalBelanja = selesai.reduce((s, x) => s + Number(x.total || 0), 0);

  return (
    <aside className="pl-panel" aria-label="Detail pelanggan">
      <div className="pl-panel-kepala">
        <h2>Detail Pelanggan</h2>
        <button type="button" className="pl-tutup" onClick={onTutup} aria-label="Tutup detail">
          ×
        </button>
      </div>

      {memuat ? (
        <p className="pl-redup-teks">Memuat detail...</p>
      ) : !pelanggan ? (
        <p className="pl-redup-teks">Pelanggan tidak ditemukan.</p>
      ) : (
        <div className="pl-panel-isi">
          <div className="pl-ringkas-atas">
            <div className="pl-identitas">
              <span className="pl-inisial">{(pelanggan.nama || "?").trim().charAt(0).toUpperCase()}</span>
              <div>
                <strong className="pl-nama-besar">{pelanggan.nama || "-"}</strong>
                <span className="pl-redup-teks">Bergabung {formatTanggal(pelanggan.created_at)}</span>
              </div>
            </div>
            <span className={`pl-status ${pelanggan.aktif ? "aktif" : "nonaktif"}`}>
              {pelanggan.aktif ? "Aktif" : "Nonaktif"}
            </span>
          </div>

          <button type="button" className="pl-wa" onClick={() => bukaWhatsApp(pelanggan.telepon, pelanggan.nama)}>
            <IkonWA /> Chat WhatsApp
          </button>

          {pesan && <div className={`pl-pesan ${pesan.jenis}`}>{pesan.teks}</div>}

          <div className="pl-angka">
            <div><strong>{pesanan.length}</strong><span>Pesanan</span></div>
            <div><strong>{berjalan.length}</strong><span>Sedang berjalan</span></div>
            <div className="lebar"><strong>{formatRupiah(totalBelanja)}</strong><span>Total belanja (pesanan selesai)</span></div>
          </div>

          <section className="pl-blok">
            <h3>Kontak</h3>
            <p className="pl-tebal">{pelanggan.telepon || "-"}</p>
            {pelanggan.email && <p>{pelanggan.email}</p>}
            <p className="pl-redup-teks">{pelanggan.alamat || "Alamat belum diisi"}</p>
            <p className="pl-redup-teks">Tipe: {labelTipe(pelanggan.tipe)}</p>
          </section>

          <section className="pl-blok">
            <h3>Pesanan Terakhir</h3>
            {pesanan.length === 0 ? (
              <p className="pl-redup-teks">Belum ada pesanan.</p>
            ) : (
              <ul className="pl-riwayat">
                {pesanan.slice(0, 5).map((x) => (
                  <li key={x.id}>
                    <Link href={`/admin/pesanan/${x.id}`}>
                      <span>
                        <span className="pl-tebal">{x.nomor_pesanan || `#${x.id}`}</span>
                        <span className="pl-redup-teks">{formatTanggal(x.created_at)} · {x.cabang?.nama || "-"}</span>
                      </span>
                      <span className="pl-riwayat-kanan">
                        <span className="pl-tebal">{formatRupiah(x.total)}</span>
                        <span className={`pl-st-pesanan ${STATUS_PESANAN[x.status] ? x.status : "lainnya"}`}>
                          {labelStatusPesanan(x.status)}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {pesanan.length > 5 && (
              <p className="pl-redup-teks pl-lagi">+{pesanan.length - 5} pesanan lain di halaman lengkap</p>
            )}
          </section>

          <div className="pl-aksi">
            <Link href={`/admin/pelanggan/${pelanggan.id}/edit`} className="pl-btn utama">
              Edit Data
            </Link>
            <button
              type="button"
              className={`pl-btn ${pelanggan.aktif ? "bahaya" : "hijau"}`}
              disabled={proses}
              onClick={ubahAktif}
            >
              {pelanggan.aktif ? "Nonaktifkan" : "Aktifkan"}
            </button>
            <Link href={`/admin/pelanggan/${pelanggan.id}`} className="pl-btn">
              Buka halaman lengkap
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}

// ================= HALAMAN =================
export default function AdminPelangganPage() {
  const [pelanggan, setPelanggan] = useState([]);
  const [belanja, setBelanja] = useState({});
  const [total, setTotal] = useState(0);
  const [ringkas, setRingkas] = useState(null);

  const [halaman, setHalaman] = useState(1);
  const [perHalaman, setPerHalaman] = useState(25);
  const [ketik, setKetik] = useState("");
  const [cari, setCari] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterTipe, setFilterTipe] = useState("");
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
    const hitung = (atur) => {
      let q = supabase.from("pelanggan").select("id", { count: "exact", head: true });
      if (atur) q = atur(q);
      return q;
    };
    const [semua, aktif, nonaktif, baru] = await Promise.all([
      hitung(),
      hitung((q) => q.eq("aktif", true)),
      hitung((q) => q.eq("aktif", false)),
      hitung((q) => q.gte("created_at", awal30Hari())),
    ]);
    setRingkas({
      semua: semua.count ?? 0,
      aktif: aktif.count ?? 0,
      nonaktif: nonaktif.count ?? 0,
      baru: baru.count ?? 0,
    });
  }, []);

  useEffect(() => {
    muatRingkasan();
  }, [muatRingkasan]);

  const muatPelanggan = useCallback(async () => {
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
      .from("pelanggan")
      .select("id, created_at, nama, email, telepon, tipe, alamat, aktif", { count: "exact" });

    if (cari) {
      const kata = cari.replace(/[,()%*]/g, " ").trim();
      if (kata) q = q.or(`nama.ilike.%${kata}%,telepon.ilike.%${kata}%,email.ilike.%${kata}%`);
    }
    if (filterStatus === "aktif") q = q.eq("aktif", true);
    if (filterStatus === "nonaktif") q = q.eq("aktif", false);
    if (filterStatus === "baru") q = q.gte("created_at", awal30Hari());
    if (filterTipe === "guest") q = q.eq("tipe", "guest");
    if (filterTipe === "terdaftar") q = q.in("tipe", ["terdaftar", "registered"]);

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

    setPelanggan(data || []);
    setTotal(count || 0);

    // Jumlah pesanan & total belanja (pesanan selesai) untuk pelanggan di halaman ini
    const ids = (data || []).map((x) => x.id);
    if (ids.length > 0) {
      const { data: ps } = await supabase
        .from("pesanan")
        .select("pelanggan_id, status, total")
        .in("pelanggan_id", ids)
        .is("deleted_at", null)
        .limit(10000);
      const peta = {};
      (ps || []).forEach((x) => {
        if (!peta[x.pelanggan_id]) peta[x.pelanggan_id] = { jumlah: 0, uang: 0 };
        peta[x.pelanggan_id].jumlah += 1;
        if (x.status === "selesai") peta[x.pelanggan_id].uang += Number(x.total || 0);
      });
      setBelanja(peta);
    } else {
      setBelanja({});
    }
    setLoading(false);
  }, [halaman, perHalaman, cari, filterStatus, filterTipe, urutan]);

  useEffect(() => {
    muatPelanggan();
  }, [muatPelanggan]);

  function resetFilter() {
    setKetik("");
    setCari("");
    setFilterStatus("");
    setFilterTipe("");
    setUrutan({ kunci: null, arah: "asc" });
    setHalaman(1);
  }

  const totalHalaman = Math.max(1, Math.ceil(total / perHalaman));
  const adaFilter = ketik || filterStatus || filterTipe || urutan.kunci;

  const kartu = [
    { kunci: "semua", status: "", label: "Total Pelanggan" },
    { kunci: "aktif", status: "aktif", label: "Aktif" },
    { kunci: "nonaktif", status: "nonaktif", label: "Nonaktif" },
    { kunci: "baru", status: "baru", label: "Baru (30 hari)" },
  ];

  return (
    <main className="admin-content">
      <div className="admin-page-header">
        <div>
          <h1>Pelanggan</h1>
          <p>Data pelanggan dari pesanan website. Klik satu pelanggan untuk melihat detail dan riwayat pesanannya.</p>
        </div>
      </div>

      <div className="pl-kartu-grid">
        {kartu.map((k) => (
          <button
            key={k.kunci}
            type="button"
            className={`pl-kartu ${k.kunci} ${filterStatus === k.status && (k.status || !adaFilter) ? "dipilih" : ""}`}
            onClick={() => {
              setFilterStatus(filterStatus === k.status ? "" : k.status);
              setHalaman(1);
            }}
          >
            <span className="pl-kartu-ikon"><Ikon nama={k.kunci} /></span>
            <span className="pl-kartu-teks">
              <strong>{ringkas ? ringkas[k.kunci] : "–"}</strong>
              <span>{k.label}</span>
            </span>
          </button>
        ))}
      </div>

      <div className={`pl-tata ${dipilih ? "ada-panel" : ""}`}>
        <div className="admin-product-table-card pl-daftar">
          <div className="pl-filter">
            <div className="cari-x-wrap">
              <input
                type="text"
                placeholder="Cari nama, nomor WhatsApp, atau email..."
                value={ketik}
                onChange={(e) => setKetik(e.target.value)}
              />
              {ketik !== "" && (
                <button type="button" className="cari-x" onClick={() => setKetik("")} aria-label="Hapus pencarian" title="Hapus pencarian">
                  ×
                </button>
              )}
            </div>

            <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setHalaman(1); }}>
              <option value="">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
              <option value="baru">Baru (30 hari)</option>
            </select>

            <select value={filterTipe} onChange={(e) => { setFilterTipe(e.target.value); setHalaman(1); }}>
              <option value="">Semua Tipe</option>
              <option value="guest">Guest</option>
              <option value="terdaftar">Terdaftar</option>
            </select>

            <button type="button" className="pl-reset" onClick={resetFilter} disabled={!adaFilter}>
              Reset
            </button>
          </div>

          {error && <div className="admin-message admin-message-error pl-err">{error}</div>}

          {!loading && pelanggan.length === 0 ? (
            <div className="pl-kosong">
              <h2>{adaFilter ? "Pelanggan tidak ditemukan" : "Belum ada pelanggan"}</h2>
              <p>{adaFilter ? "Coba ubah pencarian atau filter." : "Pelanggan otomatis tercatat saat ada pesanan dari website."}</p>
            </div>
          ) : (
            <div className="admin-product-table-wrapper">
              <table>
                <thead>
                  <tr>
                    <KolomUrut urut={urut} kunci="nama">Pelanggan</KolomUrut>
                    <th className="pl-sembunyi-panel">Email</th>
                    <th>Pesanan</th>
                    <th className="pl-sembunyi-panel">Total Belanja</th>
                    <KolomUrut urut={urut} kunci="bergabung" className="pl-sembunyi-panel">Bergabung</KolomUrut>
                    <KolomUrut urut={urut} kunci="status">Status</KolomUrut>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody className={loading ? "pl-redup" : ""}>
                  {pelanggan.map((p) => {
                    const b = belanja[p.id];
                    return (
                      <tr
                        key={p.id}
                        className={`pl-baris ${dipilih === p.id ? "aktif" : ""}`}
                        onClick={() => setDipilih(p.id)}
                      >
                        <td>
                          <span className="pl-nama">{p.nama || "-"}</span>
                          <span className="pl-kecil">{p.telepon || "-"}</span>
                        </td>
                        <td className="pl-sembunyi-panel">
                          {p.email ? <span className="pl-email">{p.email}</span> : <span className="pl-kecil">-</span>}
                        </td>
                        <td>{b ? b.jumlah : 0}</td>
                        <td className="pl-sembunyi-panel pl-uang">{formatRupiah(b ? b.uang : 0)}</td>
                        <td className="pl-sembunyi-panel pl-nowrap">{formatTanggal(p.created_at)}</td>
                        <td>
                          <span className={`pl-status ${p.aktif ? "aktif" : "nonaktif"}`}>{p.aktif ? "Aktif" : "Nonaktif"}</span>
                        </td>
                        <td>
                          <div className="pl-aksi-baris">
                            <button
                              type="button"
                              className="pl-ikon wa"
                              onClick={(e) => { e.stopPropagation(); bukaWhatsApp(p.telepon, p.nama); }}
                              title="Chat WhatsApp"
                              aria-label="Chat WhatsApp"
                            >
                              <IkonWA />
                            </button>
                            <button
                              type="button"
                              className="pl-ikon"
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

          <div className="pl-bawah">
            <label className="pl-per">
              Tampilkan
              <select value={perHalaman} onChange={(e) => { setPerHalaman(Number(e.target.value)); setHalaman(1); }}>
                {PILIHAN_PER_HALAMAN.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              per halaman
            </label>
            <div className="pl-paginasi">
              <Paginasi halaman={halaman} totalHalaman={totalHalaman} totalData={total} perHalaman={perHalaman} onGanti={setHalaman} satuan="pelanggan" />
            </div>
          </div>
        </div>

        {dipilih && (
          <>
            <div className="pl-latar" onClick={() => setDipilih(null)} />
            <PanelDetail
              key={dipilih}
              id={dipilih}
              onTutup={() => setDipilih(null)}
              onBerubah={() => {
                muatPelanggan();
                muatRingkasan();
              }}
            />
          </>
        )}
      </div>

      <style>{`
        .pl-kartu-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-bottom: 20px; }
        .pl-kartu { display: flex; align-items: center; gap: 14px; padding: 16px 18px; border: 1px solid #eadfce; border-radius: 14px; background: #fff; text-align: left; cursor: pointer; font: inherit; color: #3f2f24; transition: border-color .15s ease, box-shadow .15s ease; }
        .pl-kartu:hover { border-color: #d6c1a8; box-shadow: 0 4px 14px rgba(59,42,32,.06); }
        .pl-kartu.dipilih { border-color: #6f4c36; box-shadow: 0 0 0 2px rgba(111,76,54,.15); }
        .pl-kartu-ikon { width: 46px; height: 46px; flex-shrink: 0; display: grid; place-items: center; border-radius: 12px; }
        .pl-kartu.semua .pl-kartu-ikon { background: #f3e8da; color: #6f4c36; }
        .pl-kartu.aktif .pl-kartu-ikon { background: #e4f5e9; color: #2f7a46; }
        .pl-kartu.nonaktif .pl-kartu-ikon { background: #fbe9e7; color: #b23b2e; }
        .pl-kartu.baru .pl-kartu-ikon { background: #e6efff; color: #2f5fa3; }
        .pl-kartu-teks { display: grid; gap: 2px; }
        .pl-kartu-teks strong { font-size: 24px; line-height: 1.1; }
        .pl-kartu-teks span { font-size: 13.5px; color: #7d6957; }

        .pl-tata { display: grid; grid-template-columns: minmax(0, 1fr); gap: 20px; align-items: start; }
        .pl-tata.ada-panel { grid-template-columns: minmax(0, 1fr) 380px; }
        .pl-tata.ada-panel .pl-sembunyi-panel { display: none; }
        .pl-daftar { min-width: 0; }

        .pl-filter { display: grid; grid-template-columns: minmax(220px, 2fr) repeat(2, minmax(130px, 1fr)) auto; gap: 10px; padding: 16px; border-bottom: 1px solid #f0e7db; }
        .pl-tata.ada-panel .pl-filter { grid-template-columns: 1fr 1fr; }
        .pl-tata.ada-panel .pl-filter .cari-x-wrap { grid-column: 1 / -1; }
        .pl-filter select, .pl-filter input { height: 44px; }
        .pl-filter select { padding: 0 12px; }
        .pl-reset { height: 44px; padding: 0 16px; border: 1px solid #e0cfbb; border-radius: 10px; background: #fff; color: #5c3e2c; font-weight: 600; cursor: pointer; }
        .pl-reset:disabled { opacity: .45; cursor: default; }
        .pl-err { margin: 14px 16px 0; }

        .pl-daftar table th, .pl-daftar table td { padding: 12px 14px; border-bottom: 1px solid #f0e7db; }
        .pl-baris { cursor: pointer; transition: background .12s ease; }
        .pl-baris:hover { background: #fcf8f2; }
        .pl-baris.aktif { background: #f8efe3; }
        .pl-nama { display: block; font-weight: 600; }
        .pl-kecil { display: block; font-size: 12.5px; color: #9a8571; }
        .pl-email { display: block; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .pl-uang { font-weight: 700; white-space: nowrap; }
        .pl-nowrap { white-space: nowrap; }

        .pl-status { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; white-space: nowrap; }
        .pl-status.aktif { background: #eaf7ed; color: #347045; }
        .pl-status.nonaktif { background: #fbecec; color: #943f3f; }

        .pl-aksi-baris { display: flex; gap: 6px; }
        .pl-ikon { width: 34px; height: 34px; display: grid; place-items: center; border: 1px solid #e0cfbb; border-radius: 8px; background: #fff; color: #4b3326; cursor: pointer; }
        .pl-ikon:hover { background: #f8f1e8; }
        .pl-ikon.wa { background: #25d366; border-color: #25d366; color: #fff; }
        .pl-ikon.wa:hover { background: #1fb457; }

        .pl-redup { opacity: .5; }
        .pl-kosong { padding: 40px 20px; text-align: center; }
        .pl-kosong p { margin: 0; color: #7d6957; }

        .pl-bawah { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; padding: 4px 16px 16px; }
        .pl-per { display: flex; align-items: center; gap: 8px; font-size: 13.5px; color: #7d6957; margin-top: 18px; }
        .pl-per select { height: 36px; padding: 0 8px; }
        .pl-paginasi { flex: 1; min-width: 260px; }

        /* Panel detail */
        .pl-panel { position: sticky; top: 0; max-height: calc(100vh - 120px); overflow-y: auto; background: #fff; border: 1px solid #eadfce; border-radius: 14px; box-shadow: 0 8px 24px rgba(59,42,32,.08); }
        .pl-latar { display: none; }
        .pl-panel-kepala { position: sticky; top: 0; z-index: 2; display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; background: #fff; border-bottom: 1px solid #f0e7db; }
        .pl-panel-kepala h2 { margin: 0 !important; font-size: 17px !important; }
        .pl-tutup { width: 32px; height: 32px; border: none; border-radius: 8px; background: #f3eadf; color: #4b3326; font-size: 22px; line-height: 1; cursor: pointer; }
        .pl-panel-isi { padding: 16px 18px 20px; display: grid; gap: 14px; }
        .pl-ringkas-atas { display: flex; justify-content: space-between; gap: 10px; align-items: flex-start; }
        .pl-identitas { display: flex; gap: 12px; align-items: center; min-width: 0; }
        .pl-inisial { width: 44px; height: 44px; flex-shrink: 0; display: grid; place-items: center; border-radius: 50%; background: #f3e8da; color: #6f4c36; font-weight: 800; font-size: 18px; }
        .pl-nama-besar { display: block; font-size: 16px; overflow-wrap: anywhere; }
        .pl-wa { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 42px; border: none; border-radius: 10px; background: #25d366; color: #fff; font-weight: 700; font-size: 14.5px; cursor: pointer; }
        .pl-wa:hover { background: #1fb457; }
        .pl-pesan { padding: 10px 12px; border-radius: 10px; font-size: 13.5px; }
        .pl-pesan.gagal { background: #fbebe7; color: #8a3b2b; }
        .pl-pesan.sukses { background: #eaf7ed; color: #2f6b3f; }

        .pl-angka { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .pl-angka > div { display: grid; gap: 2px; padding: 10px 12px; border-radius: 10px; background: #fcf6ee; }
        .pl-angka > div.lebar { grid-column: 1 / -1; }
        .pl-angka strong { font-size: 18px; color: #3f2f24; }
        .pl-angka span { font-size: 12.5px; color: #7d6957; }

        .pl-blok { padding: 14px; border: 1px solid #f0e7db; border-radius: 12px; background: #fcfaf7; }
        .pl-blok h3 { margin: 0 0 8px !important; font-size: 13px !important; color: #9a8571 !important; }
        .pl-blok p { margin: 2px 0; font-size: 14px; overflow-wrap: anywhere; }
        .pl-tebal { font-weight: 700; }
        .pl-redup-teks { display: block; font-size: 13px; color: #7d6957; }
        .pl-panel > .pl-redup-teks { padding: 18px; }
        .pl-lagi { margin-top: 8px !important; }

        .pl-riwayat { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
        .pl-riwayat a { display: flex; justify-content: space-between; gap: 10px; padding: 8px; margin: 0 -8px; border-radius: 8px; color: inherit; text-decoration: none; font-size: 14px; }
        .pl-riwayat a:hover { background: #f6eee3; }
        .pl-riwayat a > span { display: grid; gap: 1px; min-width: 0; }
        .pl-riwayat-kanan { justify-items: end; text-align: right; }
        .pl-st-pesanan { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11.5px; font-weight: 700; white-space: nowrap; }
        .pl-st-pesanan.baru { background: #fff3d9; color: #8a641d; }
        .pl-st-pesanan.diproses { background: #eaf2ff; color: #315d91; }
        .pl-st-pesanan.selesai { background: #eaf7ed; color: #347045; }
        .pl-st-pesanan.dibatalkan { background: #fbecec; color: #943f3f; }
        .pl-st-pesanan.lainnya { background: #fdf0e1; color: #9a5b16; }

        .pl-aksi { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .pl-btn { display: inline-flex; align-items: center; justify-content: center; min-height: 42px; padding: 0 12px; border: 1px solid #e0cfbb; border-radius: 10px; background: #fff; color: #4b3326; font-weight: 700; font-size: 14px; text-decoration: none; cursor: pointer; font-family: inherit; }
        .pl-btn:hover { background: #f8f1e8; }
        .pl-btn.utama { background: #6f4c36; border-color: #6f4c36; color: #fff; }
        .pl-btn.hijau { background: #2f9e57; border-color: #2f9e57; color: #fff; }
        .pl-btn.bahaya { background: #fbebe7; border-color: #efc7bc; color: #a33a2c; }
        .pl-btn:disabled { opacity: .6; cursor: wait; }
        .pl-aksi > a.pl-btn:last-child { grid-column: 1 / -1; }

        @media (max-width: 1200px) {
          .pl-tata.ada-panel { grid-template-columns: minmax(0, 1fr); }
          .pl-tata.ada-panel .pl-sembunyi-panel { display: table-cell; }
          .pl-latar { display: block; position: fixed; inset: 0; z-index: 1003; background: rgba(30,20,14,.45); }
          .pl-panel { position: fixed; top: 0; right: 0; bottom: 0; z-index: 1004; width: min(420px, 100%); max-height: none; border-radius: 0; }
        }

        @media (max-width: 1000px) {
          .pl-filter { grid-template-columns: 1fr 1fr; }
          .pl-filter .cari-x-wrap { grid-column: 1 / -1; }
        }

        @media (max-width: 900px) {
          .pl-kartu-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }

        @media (max-width: 700px) {
          .pl-sembunyi-panel, .pl-tata.ada-panel .pl-sembunyi-panel { display: none !important; }
        }

        @media (max-width: 520px) {
          .pl-filter { grid-template-columns: 1fr; }
          .pl-kartu { padding: 12px; gap: 10px; }
          .pl-kartu-ikon { width: 38px; height: 38px; }
          .pl-kartu-teks strong { font-size: 20px; }
        }
      `}</style>
    </main>
  );
}
