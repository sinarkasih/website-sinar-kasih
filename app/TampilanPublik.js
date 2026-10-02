"use client";

// Lokasi file: app/TampilanPublik.js
// Menampilkan bagian tampilan toko (menu atas, menu bawah, footer)
// HANYA di halaman toko. Di halaman /admin bagian ini disembunyikan.

import { usePathname } from "next/navigation";

export default function TampilanPublik({ children }) {
  const pathname = usePathname();

  if (pathname && pathname.startsWith("/admin")) {
    return null;
  }

  return children;
}
