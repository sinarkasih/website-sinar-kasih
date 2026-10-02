"use client";

// Lokasi file: app/admin/AdminContext.js
// Menyimpan data akun yang sedang login (nama, jabatan)
// supaya bisa dipakai halaman admin mana pun.

import { createContext, useContext } from "react";

export const AdminContext = createContext(null);

export function useAdmin() {
  return useContext(AdminContext);
}
