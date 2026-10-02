"use client";

// PENJAGA HALAMAN ADMIN
// Lokasi file: app/admin/template.js
// Setiap halaman di dalam /admin akan diperiksa dulu:
// sudah login? terdaftar di tabel admin? aktif? role diizinkan?
// Jika tidak, pengunjung dialihkan ke /admin/login.

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSupabase } from "../../lib/supabase";

const ROLE_DIIZINKAN = ["admin_utama", "karyawan_produk"];

export default function AdminTemplate({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const halamanLogin = pathname === "/admin/login";
  const [diizinkan, setDiizinkan] = useState(halamanLogin);

  useEffect(() => {
    if (halamanLogin) {
      setDiizinkan(true);
      return;
    }

    let dibatalkan = false;

    async function periksaAkses() {
      const supabase = getSupabase();
      if (!supabase) {
        router.replace("/admin/login");
        return;
      }

      // Cek ke server Supabase apakah sesi login masih sah
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData?.user) {
        router.replace("/admin/login");
        return;
      }

      // Cek apakah akun ini terdaftar sebagai admin aktif
      const { data: admin } = await supabase
        .from("admin")
        .select("role, aktif")
        .eq("auth_user_id", userData.user.id)
        .eq("aktif", true)
        .maybeSingle();

      if (!admin || !ROLE_DIIZINKAN.includes(admin.role)) {
        await supabase.auth.signOut();
        router.replace("/admin/login");
        return;
      }

      if (!dibatalkan) setDiizinkan(true);
    }

    setDiizinkan(false);
    periksaAkses();

    return () => {
      dibatalkan = true;
    };
  }, [pathname, halamanLogin, router]);

  if (!diizinkan) {
    // Layar penutup selama pemeriksaan (menutupi menu admin juga)
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "#f5f0e8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#5a3e2b",
          fontSize: "16px",
        }}
      >
        Memeriksa akses admin...
      </div>
    );
  }

  return children;
}
