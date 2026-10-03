// Lokasi file: app/KategoriPohon.js
// Alat bantu untuk kategori bertingkat (level 1, 2, 3, ...).

export function buatPohon(daftar) {
  const perId = {};
  const anakDari = {};
  (daftar || []).forEach((k) => {
    perId[k.id] = k;
    const induk = k.parent_id || "akar";
    if (!anakDari[induk]) anakDari[induk] = [];
    anakDari[induk].push(k);
  });

  Object.values(anakDari).forEach((arr) =>
    arr.sort(
      (a, b) =>
        (Number(a.urutan) || 0) - (Number(b.urutan) || 0) ||
        String(a.nama).localeCompare(String(b.nama), "id")
    )
  );

  function anak(id) {
    return anakDari[id || "akar"] || [];
  }

  // Daftar induk dari paling atas sampai kategori ini
  function jalur(id) {
    const hasil = [];
    let k = perId[id];
    let jaga = 0;
    while (k && jaga < 10) {
      hasil.unshift(k);
      k = k.parent_id ? perId[k.parent_id] : null;
      jaga += 1;
    }
    return hasil;
  }

  function label(id) {
    return jalur(id).map((k) => k.nama).join(" › ");
  }

  // Kategori ini + semua turunannya
  function keturunan(id) {
    const hasil = [id];
    const antre = [id];
    while (antre.length) {
      const cur = antre.shift();
      anak(cur).forEach((c) => {
        if (!hasil.includes(c.id)) {
          hasil.push(c.id);
          antre.push(c.id);
        }
      });
    }
    return hasil;
  }

  // Semua kategori diurutkan seperti pohon (untuk pilihan di form)
  function urutPohon() {
    const hasil = [];
    function jalan(id, kedalaman) {
      anak(id).forEach((k) => {
        hasil.push({ ...k, kedalaman, label: label(k.id) });
        jalan(k.id, kedalaman + 1);
      });
    }
    jalan(null, 0);
    // kategori yang induknya tidak ditemukan tetap ikut
    (daftar || []).forEach((k) => {
      if (!hasil.some((h) => h.id === k.id)) {
        hasil.push({ ...k, kedalaman: 0, label: k.nama });
      }
    });
    return hasil;
  }

  return { perId, anak, jalur, label, keturunan, urutPohon };
}
