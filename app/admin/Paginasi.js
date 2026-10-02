"use client";

// Lokasi file: app/admin/Paginasi.js
// Tombol halaman 1 2 3 ... untuk daftar panjang di panel admin.

function daftarNomor(sekarang, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const nomor = new Set([1, total, sekarang, sekarang - 1, sekarang + 1]);
  if (sekarang <= 3) [2, 3, 4].forEach((n) => nomor.add(n));
  if (sekarang >= total - 2) [total - 1, total - 2, total - 3].forEach((n) => nomor.add(n));

  const urut = [...nomor].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const hasil = [];
  urut.forEach((n, i) => {
    if (i > 0 && n - urut[i - 1] > 1) hasil.push("…" + n);
    hasil.push(n);
  });
  return hasil;
}

export default function Paginasi({
  halaman,
  totalHalaman,
  totalData,
  perHalaman,
  onGanti,
  satuan = "data",
}) {
  if (!totalData) return null;

  const awal = (halaman - 1) * perHalaman + 1;
  const akhir = Math.min(halaman * perHalaman, totalData);

  function ganti(n) {
    if (n < 1 || n > totalHalaman || n === halaman) return;
    onGanti(n);
    document
      .querySelector(".adm-konten")
      ?.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="pgn">
      <span className="pgn-info">
        Menampilkan {awal}–{akhir} dari {totalData} {satuan}
      </span>

      {totalHalaman > 1 && (
        <div className="pgn-tombol">
          <button
            type="button"
            onClick={() => ganti(halaman - 1)}
            disabled={halaman === 1}
            aria-label="Halaman sebelumnya"
          >
            ‹
          </button>

          {daftarNomor(halaman, totalHalaman).map((n) =>
            typeof n === "string" ? (
              <span key={n} className="pgn-titik">
                …
              </span>
            ) : (
              <button
                key={n}
                type="button"
                onClick={() => ganti(n)}
                className={n === halaman ? "aktif" : ""}
                aria-current={n === halaman ? "page" : undefined}
              >
                {n}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => ganti(halaman + 1)}
            disabled={halaman === totalHalaman}
            aria-label="Halaman berikutnya"
          >
            ›
          </button>
        </div>
      )}

      <style>{`
        .pgn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 18px;
        }

        .pgn-info {
          font-size: 13.5px;
          color: #7d6957;
        }

        .pgn-tombol {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-wrap: wrap;
        }

        .pgn-tombol button {
          min-width: 36px;
          height: 36px;
          padding: 0 10px;
          border: 1px solid #e0cfbb;
          border-radius: 8px;
          background: #ffffff;
          color: #4b3326;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .pgn-tombol button:hover:not(:disabled) {
          background: #f8f1e8;
        }

        .pgn-tombol button.aktif {
          background: #6f4c36;
          border-color: #6f4c36;
          color: #ffffff;
        }

        .pgn-tombol button:disabled {
          opacity: 0.4;
          cursor: default;
        }

        .pgn-titik {
          padding: 0 4px;
          color: #9a8571;
        }
      `}</style>
    </div>
  );
}
