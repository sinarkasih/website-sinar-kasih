"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "../../../lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const supabase = getSupabase();

    if (!supabase) {
      setError("Koneksi database belum tersedia.");
      setLoading(false);
      return;
    }

    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError) {
      setError("Email atau password salah.");
      setLoading(false);
      return;
    }

    const user = data.user;

    const { data: admin, error: adminError } = await supabase
      .from("admin")
      .select("id, nama, email, role, aktif")
      .eq("auth_user_id", user.id)
      .eq("aktif", true)
      .maybeSingle();

    if (adminError) {
      await supabase.auth.signOut();
      setError("Akun berhasil login, tetapi data admin belum tersedia.");
      setLoading(false);
      return;
    }

    if (!admin) {
      await supabase.auth.signOut();
      setError("Akun ini tidak memiliki akses admin.");
      setLoading(false);
      return;
    }

    if (
      admin.role !== "admin_utama" &&
      admin.role !== "karyawan_produk"
    ) {
      await supabase.auth.signOut();
      setError("Role akun tidak diizinkan.");
      setLoading(false);
      return;
    }

    router.push("/admin");
  }

  return (
    <main className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          SINAR KASIH
        </div>

        <h1>Login Admin</h1>

        <p className="admin-login-subtitle">
          Kelola Toko Listrik Sinar Kasih
        </p>

        <form onSubmit={handleLogin}>
          <label>Email</label>

          <input
            type="email"
            placeholder="Masukkan email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Masukkan password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="admin-login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Memproses..." : "Login"}
          </button>
        </form>

        <a href="/" className="admin-back-link">
          ← Kembali ke Website
        </a>
      </div>
    </main>
  );
}
