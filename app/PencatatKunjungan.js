"use client";

// Lokasi file: app/PencatatKunjungan.js
// Mencatat statistik kunjungan website secara anonim untuk menu Statistik admin:
// - setiap halaman yang dibuka (termasuk produk yang dilihat),
// - setiap klik tombol/tautan WhatsApp,
// - dari mana pengunjung datang (Google, Facebook, Instagram, langsung, dll).
// Tidak mencatat nama, nomor HP, atau alamat IP. Halaman /admin tidak dicatat,
// begitu juga perangkat yang pernah dipakai login ke panel admin.

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getSupabase } from "../lib/supabase";

const KUNCI_PENGUNJUNG = "sk_pengunjung";
const KUNCI_SESI = "sk_sesi_mulai";
const KUNCI_ADMIN = "sk_tanpa_statistik";

function ambilStorage(jenis, kunci) {
  try {
    return window[jenis].getItem(kunci);
  } catch {
    return null;
  }
}

function simpanStorage(jenis, kunci, nilai) {
  try {
    window[jenis].setItem(kunci, nilai);
  } catch {
    // penyimpanan browser tidak tersedia (misalnya mode privat tertentu)
  }
}

function idPengunjung() {
  let id = ambilStorage("localStorage", KUNCI_PENGUNJUNG);
  if (!id) {
    id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
    simpanStorage("localStorage", KUNCI_PENGUNJUNG, id);
  }
  return id.slice(0, 64);
}

function namaSumber(referrer) {
  if (!referrer) return "langsung";
  let host = "";
  try {
    host = new URL(referrer).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "langsung";
  }
  if (!host || host === window.location.hostname.replace(/^www\./, "")) return null;
  if (host.includes("google.")) return "Google";
  if (host.includes("facebook.") || host === "fb.com" || host.endsWith(".fb.com") || host === "m.me") return "Facebook";
  if (host.includes("instagram.")) return "Instagram";
  if (host.includes("tiktok.")) return "TikTok";
  if (host.includes("youtube.") || host === "youtu.be") return "YouTube";
  if (host.includes("whatsapp.") || host === "wa.me") return "WhatsApp";
  if (host.includes("bing.")) return "Bing";
  return host.slice(0, 60);
}

function bolehMencatat(path) {
  if (typeof window === "undefined") return false;
  if (!path || path.startsWith("/admin")) return false;
  if (navigator.webdriver) return false;
  if (ambilStorage("localStorage", KUNCI_ADMIN) === "1") return false;
  return true;
}

function kirim(baris) {
  const supabase = getSupabase();
  if (!supabase) return;
  // Sengaja tanpa .select(): pengunjung hanya boleh menambah, tidak membaca.
  supabase
    .from("statistik_kunjungan")
    .insert(baris)
    .then(({ error }) => {
      if (error && process.env.NODE_ENV !== "production") {
        console.warn("Statistik tidak tercatat:", error.message);
      }
    });
}

export default function PencatatKunjungan() {
  const pathname = usePathname();
  const terakhir = useRef({ path: "", waktu: 0 });

  // Catat setiap halaman yang dibuka
  useEffect(() => {
    if (!bolehMencatat(pathname)) return;

    const sekarang = Date.now();
    if (terakhir.current.path === pathname && sekarang - terakhir.current.waktu < 3000) return;
    terakhir.current = { path: pathname, waktu: sekarang };

    // Sumber hanya dicatat sekali di awal kunjungan (satu sesi browser)
    let sumber = null;
    if (!ambilStorage("sessionStorage", KUNCI_SESI)) {
      simpanStorage("sessionStorage", KUNCI_SESI, "1");
      sumber = namaSumber(document.referrer) || "langsung";
    }

    const cocok = pathname.match(/^\/produk\/(\d+)\/?$/);

    kirim({
      jenis: "halaman",
      path: pathname.slice(0, 300),
      produk_id: cocok ? Number(cocok[1]) : null,
      pengunjung: idPengunjung(),
      sumber,
    });
  }, [pathname]);

  // Catat setiap klik tautan WhatsApp di website
  useEffect(() => {
    function saatKlik(e) {
      const a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
      if (!a) return;
      const href = a.getAttribute("href") || "";
      if (!/wa\.me\/|api\.whatsapp\.com|whatsapp:\/\//i.test(href)) return;

      const path = window.location.pathname;
      if (!bolehMencatat(path)) return;

      kirim({
        jenis: "klik_wa",
        path: path.slice(0, 300),
        pengunjung: idPengunjung(),
      });
    }

    document.addEventListener("click", saatKlik, true);
    return () => document.removeEventListener("click", saatKlik, true);
  }, []);

  return null;
}
