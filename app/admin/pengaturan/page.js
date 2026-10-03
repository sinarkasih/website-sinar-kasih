"use client";

// Lokasi file: app/admin/pengaturan/page.js
// Pengaturan > Kelola Akun (khusus Admin Utama):
// - Tambah akun baru + pilih jabatan (hak akses)
// - Ubah nama & jabatan
// - Reset password akun lain
// - Aktifkan / nonaktifkan akun
// Tambah akun & reset password berjalan lewat Edge Function "kelola-akun" di Supabase.

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "../../../lib/supabase";

import { useUrut, KolomUrut } from "../Urut";
import BagianOptimasiFoto from "./BagianOptimasiFoto";
const DOMAIN_AKUN = "@sinarkasih.co.id";

// Daftar jabatan & hak aksesnya.
// Jabatan baru harus dibuat bersama aturan keamanan database-nya.
const JABATAN = {
  admin_utama: {
    nama: "Admin Utama",
    akses: "Semua menu, termasuk pesanan, pelanggan, toko, dan pengaturan.",
  },
  karyawan_produk: {
    nama: "Karyawan Produk",
    akses: "Hanya menu Produk (tambah, ubah, harga, foto, variasi, label) dan Akun Saya.",
  },
};

function tampilanUsername(email) {
  if (!email) return "-";
  return email.endsWith(DOMAIN_AKUN)
    ? email.slice(0, -DOMAIN_AKUN.length)
    : email;
}

async function panggilKelolaAkun(body) {
  const supabase = getSupabase();
  const { data, error } = await supabase.functions.invoke("kelola-akun", {
    body,
  });

  if (error) {
    let teks = "Gagal terhubung ke server. Pastikan Edge Function kelola-akun sudah dipasang.";
    try {
      const isi = await error.context.json();
      if (isi?.error) teks = isi.error;
    } catch (_) {}
    return { gagal: teks };
  }

  if (data?.error) return { gagal: data.error };
  return { sukses: data?.pesan || "Berhasil." };
}

function keAtas() {
  document
    .querySelector(".adm-konten")
    ?.scrollTo({ top: 0, behavior: "smooth" });
}

const FORM_KOSONG = {
  nama: "",
  username: "",
  password: "",
  role: "karyawan_produk",
};

export default function PengaturanPage() {
  const [daftar, setDaftar] = useState([]);
  const [saya, setSaya] = useState(null);
  const [memuat, setMemuat] = useState(true);
  const [pesan, setPesan] = useState(null);

  const [panel, setPanel] = useState(null); // null | "tambah" | { reset: akun }
  const [form, setForm] = useState(FORM_KOSONG);
  const [passwordReset, setPasswordReset] = useState("");
  const [lihat, setLihat] = useState(false);
  const [kirim, setKirim] = useState(false);

  const [editId, setEditId] = useState(null);
  const [editNama, setEditNama] = useState("");
  const [editRole, setEditRole] = useState("");
  const [prosesId, setProsesId] = useState(null);

  const muat = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();
    setSaya(session?.user?.id || null);

    const { data, error } = await supabase
      .from("admin")
      .select("id, auth_user_id, nama, email, role, aktif, created_at")
      .order("role", { ascending: true })
      .order("nama", { ascending: true });

    if (error) {
      console.error("Gagal memuat akun:", error);
      setPesan({ jenis: "gagal", teks: "Daftar akun gagal dimuat." });
    }

    setDaftar(data || []);
    setMemuat(false);
  }, []);

  useEffect(() => {
    muat();
  }, [muat]);

  function bukaTambah() {
    setPesan(null);
    setForm(FORM_KOSONG);
    setLihat(false);
    setPanel("tambah");
    keAtas();
  }

  function bukaReset(akun) {
    setPesan(null);
    setPasswordReset("");
    setLihat(false);
    setPanel({ reset: akun });
    keAtas();
  }

  async function simpanTambah(e) {
    e.preventDefault();
    setKirim(true);
    setPesan(null);

    const hasil = await panggilKelolaAkun({
      aksi: "tambah",
      nama: form.nama,
      username: form.username,
      password: form.password,
      role: form.role,
    });

    setKirim(false);

    if (hasil.gagal) {
      setPesan({ jenis: "gagal", teks: hasil.gagal });
      return;
    }

    setPesan({ jenis: "sukses", teks: hasil.sukses });
    setPanel(null);
    setForm(FORM_KOSONG);
    muat();
  }

  async function simpanReset(e) {
    e.preventDefault();
    setKirim(true);
    setPesan(null);

    const hasil = await panggilKelolaAkun({
      aksi: "reset_password",
      admin_id: panel.reset.id,
      password: passwordReset,
    });

    setKirim(false);

    if (hasil.gagal) {
      setPesan({ jenis: "gagal", teks: hasil.gagal });
      return;
    }

    setPesan({ jenis: "sukses", teks: hasil.sukses });
    setPanel(null);
    setPasswordReset("");
  }

  function mulaiEdit(akun) {
    setPesan(null);
    setEditId(akun.id);
    setEditNama(akun.nama || "");
    setEditRole(akun.role);
  }

  async function simpanEdit(akun) {
    const nama = editNama.trim();
    if (!nama) {
      setPesan({ jenis: "gagal", teks: "Nama tidak boleh kosong." });
      return;
    }

    setProsesId(akun.id);
    const supabase = getSupabase();
    const perubahan = { nama };
    if (akun.auth_user_id !== saya) perubahan.role = editRole;

    const { data, error } = await supabase
      .from("admin")
      .update(perubahan)
      .eq("id", akun.id)
      .select("id");

    setProsesId(null);

    if (error || !data || data.length === 0) {
      console.error("Gagal menyimpan akun:", error);
      setPesan({ jenis: "gagal", teks: "Perubahan gagal disimpan." });
      return;
    }

    setEditId(null);
    setPesan({ jenis: "sukses", teks: `Data akun ${nama} berhasil disimpan.` });
    muat();
  }

  async function ubahStatus(akun) {
    const aktifkan = !akun.aktif;
    const nama = akun.nama || tampilanUsername(akun.email);

    const yakin = window.confirm(
      aktifkan
        ? `Aktifkan kembali akun ${nama}? Akun ini akan bisa login lagi.`
        : `Nonaktifkan akun ${nama}? Akun ini tidak akan bisa membuka panel admin lagi.`
    );
    if (!yakin) return;

    setPesan(null);
    setProsesId(akun.id);
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("admin")
      .update({ aktif: aktifkan })
      .eq("id", akun.id)
      .select("id");

    setProsesId(null);

    if (error || !data || data.length === 0) {
      console.error("Gagal mengubah status:", error);
      setPesan({ jenis: "gagal", teks: "Status akun gagal diubah." });
      return;
    }

    setPesan({
      jenis: "sukses",
      teks: aktifkan
        ? `Akun ${nama} sudah aktif kembali.`
        : `Akun ${nama} sudah dinonaktifkan.`,
    });
    muat();
  }


  const urut = useUrut(daftar, {
    k0: (x) => x.nama,
    k1: (x) => x.email,
    k2: (x) => x.role,
    k3: (x) => x.aktif,
  });

  return (
    <div className="pg">
      <div className="admin-page-header">
        <div>
          <h1>Pengaturan</h1>
          <p>Kelola akun admin dan karyawan yang bisa membuka panel admin.</p>
        </div>

        <div className="pg-kepala-aksi">
          <Link href="/admin/akun" className="admin-secondary-button">
            Ganti password saya
          </Link>
          <button
            type="button"
            className="admin-primary-button"
            onClick={bukaTambah}
          >
            + Tambah akun
          </button>
        </div>
      </div>

      {pesan && (
        <div
          className={`pg-pesan ${pesan.jenis}`}
          role={pesan.jenis === "gagal" ? "alert" : "status"}
        >
          {pesan.teks}
        </div>
      )}

      {/* ===== FORM TAMBAH AKUN ===== */}
      {panel === "tambah" && (
        <div className="admin-card pg-panel">
          <h2>Tambah akun baru</h2>

          <form onSubmit={simpanTambah} className="pg-form">
            <div className="pg-form-grid">
              <div className="pg-field">
                <label htmlFor="pg-nama">Nama</label>
                <input
                  id="pg-nama"
                  type="text"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  placeholder="Nama karyawan"
                  required
                />
              </div>

              <div className="pg-field">
                <label htmlFor="pg-username">Username</label>
                <div className="pg-akhiran">
                  <input
                    id="pg-username"
                    type="text"
                    value={form.username}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        username: e.target.value.toLowerCase().replace(/\s/g, ""),
                      })
                    }
                    placeholder="Username untuk login"
                    autoCapitalize="none"
                    spellCheck={false}
                    required
                  />
                </div>
                <small>
                  Huruf kecil, angka, titik, atau strip. Tanpa spasi. Dipakai
                  karyawan untuk login.
                </small>
              </div>

              <div className="pg-field">
                <label htmlFor="pg-password">Password awal</label>
                <input
                  id="pg-password"
                  type={lihat ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  autoComplete="new-password"
                  required
                />
                <small>
                  Minimal 8 karakter. Karyawan bisa menggantinya sendiri di
                  menu Akun Saya.
                </small>
              </div>

              <div className="pg-field">
                <label htmlFor="pg-role">Jabatan</label>
                <select
                  id="pg-role"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  {Object.entries(JABATAN).map(([kode, j]) => (
                    <option key={kode} value={kode}>
                      {j.nama}
                    </option>
                  ))}
                </select>
                <small>Akses: {JABATAN[form.role].akses}</small>
              </div>
            </div>

            <label className="pg-lihat">
              <input
                type="checkbox"
                checked={lihat}
                onChange={(e) => setLihat(e.target.checked)}
              />
              Tampilkan password
            </label>

            <div className="pg-form-aksi">
              <button
                type="submit"
                className="admin-primary-button"
                disabled={kirim}
              >
                {kirim ? "Membuat akun..." : "Buat akun"}
              </button>
              <button
                type="button"
                className="admin-secondary-button"
                onClick={() => setPanel(null)}
                disabled={kirim}
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ===== FORM RESET PASSWORD ===== */}
      {panel && panel.reset && (
        <div className="admin-card pg-panel">
          <h2>Ganti password: {panel.reset.nama}</h2>
          <p className="pg-sub">
            Username: <strong>{tampilanUsername(panel.reset.email)}</strong>.
            Beritahu password baru ini ke yang bersangkutan.
          </p>

          <form onSubmit={simpanReset} className="pg-form">
            <div className="pg-field pg-sempit">
              <label htmlFor="pg-reset">Password baru</label>
              <input
                id="pg-reset"
                type={lihat ? "text" : "password"}
                value={passwordReset}
                onChange={(e) => setPasswordReset(e.target.value)}
                autoComplete="new-password"
                required
              />
              <small>Minimal 8 karakter.</small>
            </div>

            <label className="pg-lihat">
              <input
                type="checkbox"
                checked={lihat}
                onChange={(e) => setLihat(e.target.checked)}
              />
              Tampilkan password
            </label>

            <div className="pg-form-aksi">
              <button
                type="submit"
                className="admin-primary-button"
                disabled={kirim}
              >
                {kirim ? "Menyimpan..." : "Simpan password baru"}
              </button>
              <button
                type="button"
                className="admin-secondary-button"
                onClick={() => setPanel(null)}
                disabled={kirim}
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ===== DAFTAR AKUN ===== */}
      <div className="admin-card pg-kartu">
        <div className="admin-section-header">
          <h2>Akun</h2>
          <p>{memuat ? "Memuat..." : `${daftar.length} akun terdaftar.`}</p>
        </div>

        <div className="pg-tabel-wrap">
          <table>
            <thead>
              <tr>
                <KolomUrut urut={urut} kunci="k0">Nama</KolomUrut>
                <KolomUrut urut={urut} kunci="k1">Username</KolomUrut>
                <KolomUrut urut={urut} kunci="k2">Jabatan</KolomUrut>
                <KolomUrut urut={urut} kunci="k3">Status</KolomUrut>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {urut.data.map((akun) => {
                const akunSaya = akun.auth_user_id === saya;
                const sedangEdit = editId === akun.id;
                const sibuk = prosesId === akun.id;

                return (
                  <tr key={akun.id}>
                    <td>
                      {sedangEdit ? (
                        <input
                          type="text"
                          value={editNama}
                          onChange={(e) => setEditNama(e.target.value)}
                          className="pg-input"
                          autoFocus
                        />
                      ) : (
                        <span className="pg-nama">
                          {akun.nama || "-"}
                          {akunSaya && <em className="pg-anda">Anda</em>}
                        </span>
                      )}
                    </td>
                    <td>{tampilanUsername(akun.email)}</td>
                    <td>
                      {sedangEdit && !akunSaya ? (
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value)}
                          className="pg-input"
                        >
                          {Object.entries(JABATAN).map(([kode, j]) => (
                            <option key={kode} value={kode}>
                              {j.nama}
                            </option>
                          ))}
                        </select>
                      ) : (
                        JABATAN[akun.role]?.nama || akun.role
                      )}
                    </td>
                    <td>
                      <span
                        className={`pg-status ${akun.aktif ? "aktif" : "nonaktif"}`}
                      >
                        {akun.aktif ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td>
                      <div className="pg-aksi">
                        {sedangEdit ? (
                          <>
                            <button
                              type="button"
                              className="pg-btn utama"
                              onClick={() => simpanEdit(akun)}
                              disabled={sibuk}
                            >
                              {sibuk ? "Menyimpan..." : "Simpan"}
                            </button>
                            <button
                              type="button"
                              className="pg-btn"
                              onClick={() => setEditId(null)}
                              disabled={sibuk}
                            >
                              Batal
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="pg-btn"
                              onClick={() => mulaiEdit(akun)}
                              disabled={sibuk}
                            >
                              Ubah
                            </button>
                            {!akunSaya && (
                              <>
                                <button
                                  type="button"
                                  className="pg-btn"
                                  onClick={() => bukaReset(akun)}
                                  disabled={sibuk}
                                >
                                  Ganti password
                                </button>
                                <button
                                  type="button"
                                  className={`pg-btn ${
                                    akun.aktif ? "bahaya" : "utama"
                                  }`}
                                  onClick={() => ubahStatus(akun)}
                                  disabled={sibuk}
                                >
                                  {akun.aktif ? "Nonaktifkan" : "Aktifkan"}
                                </button>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== KECILKAN FOTO LAMA ===== */}
      <BagianOptimasiFoto />

      {/* ===== KETERANGAN HAK AKSES ===== */}
      <div className="admin-card pg-info">
        <h2>Hak akses per jabatan</h2>
        <ul>
          {Object.entries(JABATAN).map(([kode, j]) => (
            <li key={kode}>
              <strong>{j.nama}:</strong> {j.akses}
            </li>
          ))}
        </ul>
        <p className="pg-kecil">
          Jika karyawan berhenti bekerja, klik <strong>Nonaktifkan</strong>.
          Aksesnya langsung tertutup.
        </p>
      </div>

      <style>{`
        .pg-kepala-aksi {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .pg-pesan {
          margin-bottom: 20px;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 14px;
        }

        .pg-pesan.gagal {
          background: #fbebe7;
          border: 1px solid #efc7bc;
          color: #8a3b2b;
        }

        .pg-pesan.sukses {
          background: #eaf7ed;
          border: 1px solid #c4e5cc;
          color: #2f6b3f;
        }

        .pg-panel {
          margin-bottom: 20px;
          border-color: #d6c1a8 !important;
        }

        .pg-sub {
          margin: 4px 0 0;
          font-size: 14.5px;
          color: #7d6957;
        }

        .pg-form {
          margin-top: 16px;
        }

        .pg-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px 20px;
        }

        .pg-field {
          display: grid;
          gap: 6px;
          align-content: start;
        }

        .pg-sempit {
          max-width: 360px;
        }

        .pg-field label {
          font-size: 14px;
          font-weight: 600;
          color: #3f2f24;
        }

        .pg-field input,
        .pg-field select {
          width: 100%;
          padding: 11px 14px;
          border: 1px solid #dccbb7;
          border-radius: 10px;
          font-size: 15px;
          background: #ffffff;
        }

        .pg-field small {
          font-size: 12.5px;
          color: #9a8571;
          line-height: 1.4;
        }

        .pg-lihat {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 16px;
          font-size: 14px;
          cursor: pointer;
        }

        .pg-form-aksi {
          display: flex;
          gap: 10px;
          margin-top: 20px;
          flex-wrap: wrap;
        }

        .pg-kartu {
          margin-bottom: 20px;
        }

        .pg-tabel-wrap {
          overflow-x: auto;
        }

        .pg-tabel-wrap th,
        .pg-tabel-wrap td {
          padding: 12px 14px;
          border-bottom: 1px solid #f0e7db;
        }

        .pg-tabel-wrap tbody tr:last-child td {
          border-bottom: none;
        }

        .pg-nama {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
        }

        .pg-anda {
          font-style: normal;
          font-size: 11.5px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 999px;
          background: #f3eadf;
          color: #6f4c36;
        }

        .pg-input {
          width: 100%;
          min-width: 150px;
          padding: 8px 12px;
        }

        .pg-status {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
        }

        .pg-status.aktif {
          background: #eaf7ed;
          color: #347045;
        }

        .pg-status.nonaktif {
          background: #f0ece8;
          color: #66584e;
        }

        .pg-aksi {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .pg-btn {
          min-height: 34px;
          padding: 0 12px;
          border: 1px solid #e0cfbb;
          border-radius: 8px;
          background: #ffffff;
          color: #4b3326;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
        }

        .pg-btn:hover {
          background: #f8f1e8;
        }

        .pg-btn.utama {
          background: #6f4c36;
          border-color: #6f4c36;
          color: #ffffff;
        }

        .pg-btn.bahaya {
          border-color: #efc7bc;
          background: #fbebe7;
          color: #8a3b2b;
        }

        .pg-btn:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .pg-info ul {
          margin: 10px 0 0;
          padding-left: 20px;
          font-size: 14.5px;
          line-height: 1.8;
          color: #3f2f24;
        }

        .pg-kecil {
          margin-top: 14px !important;
          font-size: 13.5px !important;
          color: #7d6957 !important;
        }

        @media (max-width: 760px) {
          .pg-form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
