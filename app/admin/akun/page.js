"use client";

// Lokasi file: app/admin/akun/page.js
// Halaman "Akun Saya": melihat data akun sendiri dan mengganti password.
// Bisa dibuka oleh Admin Utama maupun karyawan.

import { useEffect, useState } from "react";
import { getSupabase } from "../../../lib/supabase";

const NAMA_ROLE = {
  admin_utama: "Admin Utama",
  karyawan_produk: "Karyawan Produk",
};

const DOMAIN_AKUN = "@sinarkasih.co.id";

function tampilanUsername(email) {
  if (!email) return "-";
  return email.endsWith(DOMAIN_AKUN)
    ? email.slice(0, -DOMAIN_AKUN.length)
    : email;
}

export default function AkunSayaPage() {
  const [akun, setAkun] = useState(null);
  const [lama, setLama] = useState("");
  const [baru, setBaru] = useState("");
  const [ulang, setUlang] = useState("");
  const [lihat, setLihat] = useState(false);
  const [proses, setProses] = useState(false);
  const [pesan, setPesan] = useState(null); // { jenis: "sukses" | "gagal", teks }

  useEffect(() => {
    async function muat() {
      const supabase = getSupabase();
      if (!supabase) return;

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from("admin")
        .select("nama, email, role")
        .eq("auth_user_id", session.user.id)
        .maybeSingle();

      setAkun({
        email: session.user.email,
        nama: data?.nama || "-",
        role: data?.role,
      });
    }

    muat();
  }, []);

  async function simpan(e) {
    e.preventDefault();
    setPesan(null);

    if (baru.length < 8) {
      setPesan({ jenis: "gagal", teks: "Password baru minimal 8 karakter." });
      return;
    }
    if (baru !== ulang) {
      setPesan({
        jenis: "gagal",
        teks: "Ulangi password baru tidak sama. Periksa lalu coba lagi.",
      });
      return;
    }
    if (baru === lama) {
      setPesan({
        jenis: "gagal",
        teks: "Password baru harus berbeda dari password lama.",
      });
      return;
    }

    setProses(true);
    const supabase = getSupabase();

    // 1. Pastikan password lama benar
    const { error: salahLama } = await supabase.auth.signInWithPassword({
      email: akun.email,
      password: lama,
    });

    if (salahLama) {
      setPesan({ jenis: "gagal", teks: "Password lama salah." });
      setProses(false);
      return;
    }

    // 2. Simpan password baru
    const { error: gagalUbah } = await supabase.auth.updateUser({
      password: baru,
    });

    if (gagalUbah) {
      console.error("Gagal mengganti password:", gagalUbah);
      setPesan({
        jenis: "gagal",
        teks: "Password gagal diganti. Coba lagi beberapa saat lagi.",
      });
      setProses(false);
      return;
    }

    setLama("");
    setBaru("");
    setUlang("");
    setPesan({
      jenis: "sukses",
      teks: "Password berhasil diganti. Gunakan password baru saat login berikutnya.",
    });
    setProses(false);
  }

  return (
    <div className="ak">
      <div className="admin-page-header">
        <div>
          <h1>Akun Saya</h1>
          <p>Lihat data akun Anda dan ganti password.</p>
        </div>
      </div>

      <div className="ak-grid">
        <div className="admin-card">
          <h2>Data akun</h2>
          <dl className="ak-data">
            <div>
              <dt>Nama</dt>
              <dd>{akun ? akun.nama : "–"}</dd>
            </div>
            <div>
              <dt>Username / email</dt>
              <dd>{akun ? tampilanUsername(akun.email) : "–"}</dd>
            </div>
            <div>
              <dt>Jabatan</dt>
              <dd>{akun ? NAMA_ROLE[akun.role] || "-" : "–"}</dd>
            </div>
          </dl>
          <p className="ak-catatan">
            Untuk mengubah nama atau jabatan, hubungi Admin Utama.
          </p>
        </div>

        <div className="admin-card">
          <h2>Ganti password</h2>

          <form onSubmit={simpan} className="ak-form">
            <label htmlFor="ak-lama">Password lama</label>
            <input
              id="ak-lama"
              type={lihat ? "text" : "password"}
              autoComplete="current-password"
              value={lama}
              onChange={(e) => setLama(e.target.value)}
              required
            />

            <label htmlFor="ak-baru">Password baru</label>
            <input
              id="ak-baru"
              type={lihat ? "text" : "password"}
              autoComplete="new-password"
              value={baru}
              onChange={(e) => setBaru(e.target.value)}
              required
            />
            <small className="ak-bantu">Minimal 8 karakter.</small>

            <label htmlFor="ak-ulang">Ulangi password baru</label>
            <input
              id="ak-ulang"
              type={lihat ? "text" : "password"}
              autoComplete="new-password"
              value={ulang}
              onChange={(e) => setUlang(e.target.value)}
              required
            />

            <label className="ak-lihat">
              <input
                type="checkbox"
                checked={lihat}
                onChange={(e) => setLihat(e.target.checked)}
              />
              Tampilkan password
            </label>

            {pesan && (
              <div
                className={`ak-pesan ${pesan.jenis}`}
                role={pesan.jenis === "gagal" ? "alert" : "status"}
              >
                {pesan.teks}
              </div>
            )}

            <button
              type="submit"
              className="admin-primary-button"
              disabled={proses || !akun}
            >
              {proses ? "Menyimpan..." : "Simpan password baru"}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .ak-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr);
          gap: 20px;
          align-items: start;
        }

        .ak-data {
          margin: 16px 0 0;
          display: grid;
          gap: 14px;
        }

        .ak-data div {
          display: grid;
          gap: 2px;
        }

        .ak-data dt {
          font-size: 13px;
          color: #7d6957;
        }

        .ak-data dd {
          margin: 0;
          font-size: 15.5px;
          font-weight: 600;
          color: #3f2f24;
          word-break: break-word;
        }

        .ak-catatan {
          margin: 18px 0 0;
          padding-top: 14px;
          border-top: 1px solid #f0e7db;
          font-size: 13.5px;
          color: #7d6957;
        }

        .ak-form {
          display: grid;
          margin-top: 10px;
        }

        .ak-form label {
          margin: 14px 0 6px;
          font-size: 14px;
          font-weight: 600;
          color: #3f2f24;
        }

        .ak-form input[type="text"],
        .ak-form input[type="password"] {
          width: 100%;
          padding: 11px 14px;
          border: 1px solid #dccbb7;
          border-radius: 10px;
          font-size: 15px;
        }

        .ak-bantu {
          margin-top: 6px;
          font-size: 12.5px;
          color: #9a8571;
        }

        .ak-form .ak-lihat {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 16px;
          font-weight: 500;
          cursor: pointer;
        }

        .ak-pesan {
          margin-top: 16px;
          padding: 11px 14px;
          border-radius: 10px;
          font-size: 14px;
        }

        .ak-pesan.gagal {
          background: #fbebe7;
          border: 1px solid #efc7bc;
          color: #8a3b2b;
        }

        .ak-pesan.sukses {
          background: #eaf7ed;
          border: 1px solid #c4e5cc;
          color: #2f6b3f;
        }

        .ak-form button {
          margin-top: 20px;
          justify-self: start;
        }

        @media (max-width: 900px) {
          .ak-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
