"use client";

// Lokasi file: app/admin/login/page.js

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "../../../lib/supabase";

const ROLE_DIIZINKAN = ["admin_utama", "karyawan_produk"];

const HALAMAN_AWAL = {
  admin_utama: "/admin",
  karyawan_produk: "/admin/produk",
};

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [lihatPassword, setLihatPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = getSupabase();

    if (!supabase) {
      setError("Koneksi database belum tersedia. Hubungi pengelola website.");
      setLoading(false);
      return;
    }

    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (loginError) {
      setError("Email atau password salah. Periksa lalu coba lagi.");
      setLoading(false);
      return;
    }

    const { data: admin, error: adminError } = await supabase
      .from("admin")
      .select("role, aktif")
      .eq("auth_user_id", data.user.id)
      .eq("aktif", true)
      .maybeSingle();

    if (adminError || !admin || !ROLE_DIIZINKAN.includes(admin.role)) {
      await supabase.auth.signOut();
      setError("Akun ini tidak memiliki akses ke panel admin.");
      setLoading(false);
      return;
    }

    router.replace(HALAMAN_AWAL[admin.role]);
  }

  return (
    <div className="lg-wrap">
      <div className="lg-card">
        <div className="lg-brand">
          <span className="lg-logo">SK</span>
          <span className="lg-brand-teks">
            <strong>Sinar Kasih</strong>
            <small>Toko Listrik Ambon</small>
          </span>
        </div>

        <h1>Masuk ke panel admin</h1>
        <p className="lg-sub">
          Gunakan email dan password akun admin toko.
        </p>

        <form onSubmit={handleLogin}>
          <label htmlFor="lg-email">Email</label>
          <input
            id="lg-email"
            type="email"
            autoComplete="username"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="lg-password">Password</label>
          <div className="lg-pass">
            <input
              id="lg-password"
              type={lihatPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="lg-lihat"
              onClick={() => setLihatPassword(!lihatPassword)}
              aria-label={lihatPassword ? "Sembunyikan password" : "Lihat password"}
            >
              {lihatPassword ? "Sembunyikan" : "Lihat"}
            </button>
          </div>

          {error && (
            <div className="lg-error" role="alert">
              {error}
            </div>
          )}

          <button type="submit" className="lg-submit" disabled={loading}>
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <a href="/" className="lg-back">
          Kembali ke website
        </a>
      </div>

      <style>{`
        .lg-wrap {
          position: fixed;
          inset: 0;
          z-index: 1000;
          overflow-y: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          background:
            radial-gradient(circle at 15% 20%, rgba(197, 138, 43, 0.12), transparent 45%),
            #f7f2ea;
          color: #3f2f24;
        }

        .lg-wrap *,
        .lg-wrap *::before,
        .lg-wrap *::after {
          box-sizing: border-box;
        }

        .lg-card {
          width: 100%;
          max-width: 400px;
          padding: 34px 30px 26px;
          background: #fffdf9;
          border: 1px solid #e6d9c8;
          border-radius: 18px;
          box-shadow: 0 18px 40px rgba(59, 42, 32, 0.08);
        }

        .lg-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 26px;
        }

        .lg-logo {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #6f4c36;
          color: #ffffff;
          font-weight: 800;
          font-size: 16px;
        }

        .lg-brand-teks {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }

        .lg-brand-teks strong {
          font-size: 17px;
        }

        .lg-brand-teks small {
          font-size: 13px;
          color: #9a8571;
          margin-top: 2px;
        }

        .lg-card h1 {
          margin: 0 0 6px;
          font-size: 22px;
          line-height: 1.3;
        }

        .lg-sub {
          margin: 0 0 22px;
          font-size: 14.5px;
          color: #7d6957;
        }

        .lg-card label {
          display: block;
          margin: 14px 0 6px;
          font-size: 14px;
          font-weight: 600;
        }

        .lg-card input {
          width: 100%;
          padding: 12px 14px;
          border: 1px solid #dccbb7;
          border-radius: 10px;
          background: #ffffff;
          color: #3f2f24;
          font-size: 15px;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .lg-card input:focus {
          border-color: #6f4c36;
          box-shadow: 0 0 0 3px rgba(111, 76, 54, 0.15);
        }

        .lg-pass {
          position: relative;
        }

        .lg-pass input {
          padding-right: 110px;
        }

        .lg-lihat {
          position: absolute;
          top: 50%;
          right: 8px;
          transform: translateY(-50%);
          padding: 6px 10px;
          border: none;
          border-radius: 8px;
          background: #f3eadf;
          color: #6f4c36;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .lg-error {
          margin-top: 16px;
          padding: 11px 14px;
          border-radius: 10px;
          background: #fbebe7;
          border: 1px solid #efc7bc;
          color: #8a3b2b;
          font-size: 14px;
        }

        .lg-submit {
          width: 100%;
          margin-top: 22px;
          padding: 13px;
          border: none;
          border-radius: 10px;
          background: #6f4c36;
          color: #ffffff;
          font-size: 15.5px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .lg-submit:hover {
          background: #5c3e2c;
        }

        .lg-submit:disabled {
          opacity: 0.7;
          cursor: wait;
        }

        .lg-submit:focus-visible,
        .lg-lihat:focus-visible,
        .lg-back:focus-visible {
          outline: 2px solid #c58a2b;
          outline-offset: 2px;
        }

        .lg-back {
          display: block;
          margin-top: 20px;
          text-align: center;
          font-size: 14px;
          color: #7d6957;
          text-decoration: none;
        }

        .lg-back:hover {
          color: #3f2f24;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
