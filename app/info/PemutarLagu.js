"use client";

// Lokasi file: app/info/PemutarLagu.js
// Daftar putar lagu Sinar Kasih: satu pemutar untuk semua lagu,
// tidak pernah diputar otomatis, dan setiap lagu bisa diunduh.

import { useEffect, useRef, useState } from "react";

const TAMPIL_AWAL = 4;

function formatWaktu(detik) {
  if (!detik || !isFinite(detik)) return "0:00";
  const m = Math.floor(detik / 60);
  const s = Math.floor(detik % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function linkUnduh(l) {
  const ext = (l.audio_path || "lagu.mp3").split(".").pop();
  const nama = `${l.judul} - Sinar Kasih.${ext}`;
  return `${l.audio_url}?download=${encodeURIComponent(nama)}`;
}

export default function PemutarLagu({ lagu }) {
  const audioRef = useRef(null);
  const [aktif, setAktif] = useState(null);
  const [main, setMain] = useState(false);
  const [posisi, setPosisi] = useState(0);
  const [durasi, setDurasi] = useState(0);
  const [semua, setSemua] = useState(false);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const waktu = () => setPosisi(a.currentTime);
    const meta = () => setDurasi(a.duration);
    const selesai = () => setMain(false);
    const jalan = () => setMain(true);
    const jeda = () => setMain(false);
    a.addEventListener("timeupdate", waktu);
    a.addEventListener("loadedmetadata", meta);
    a.addEventListener("ended", selesai);
    a.addEventListener("play", jalan);
    a.addEventListener("pause", jeda);
    return () => {
      a.removeEventListener("timeupdate", waktu);
      a.removeEventListener("loadedmetadata", meta);
      a.removeEventListener("ended", selesai);
      a.removeEventListener("play", jalan);
      a.removeEventListener("pause", jeda);
    };
  }, []);

  function putar(l) {
    const a = audioRef.current;
    if (!a) return;
    if (aktif === l.id) {
      if (a.paused) a.play();
      else a.pause();
      return;
    }
    setAktif(l.id);
    setPosisi(0);
    setDurasi(0);
    a.src = l.audio_url;
    a.play().catch(() => setMain(false));
  }

  function geser(e) {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Number(e.target.value);
    setPosisi(a.currentTime);
  }

  const daftar = semua ? lagu : lagu.slice(0, TAMPIL_AWAL);

  return (
    <div className="pl">
      <audio ref={audioRef} preload="none" />

      <ul className="pl-daftar">
        {daftar.map((l, i) => {
          const ini = aktif === l.id;
          return (
            <li key={l.id} className={`pl-baris ${ini ? "aktif" : ""}`}>
              <button
                type="button"
                className="pl-putar"
                onClick={() => putar(l)}
                aria-label={ini && main ? `Jeda ${l.judul}` : `Putar ${l.judul}`}
              >
                {ini && main ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="6" y="5" width="4" height="14" rx="1" />
                    <rect x="14" y="5" width="4" height="14" rx="1" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8 5.5v13a1 1 0 0 0 1.5.9l10-6.5a1 1 0 0 0 0-1.7l-10-6.5A1 1 0 0 0 8 5.5Z" />
                  </svg>
                )}
              </button>

              <div className="pl-info">
                <span className="pl-judul">
                  <span className="pl-no">{i + 1}.</span> {l.judul}
                </span>
                {l.keterangan && <span className="pl-ket">{l.keterangan}</span>}

                {ini && (
                  <div className="pl-progres">
                    <span>{formatWaktu(posisi)}</span>
                    <input
                      type="range"
                      min="0"
                      max={durasi || 0}
                      step="0.1"
                      value={posisi}
                      onChange={geser}
                      aria-label="Posisi lagu"
                    />
                    <span>{formatWaktu(durasi)}</span>
                  </div>
                )}
              </div>

              <a
                href={linkUnduh(l)}
                className="pl-unduh"
                download
                title={`Unduh ${l.judul}`}
                aria-label={`Unduh ${l.judul}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 4v11" />
                  <path d="m7 10 5 5 5-5" />
                  <path d="M5 20h14" />
                </svg>
                <span>Unduh</span>
              </a>
            </li>
          );
        })}
      </ul>

      {lagu.length > TAMPIL_AWAL && (
        <button
          type="button"
          className="pl-semua"
          onClick={() => setSemua(!semua)}
        >
          {semua ? "Tampilkan lebih sedikit" : `Lihat semua lagu (${lagu.length})`}
        </button>
      )}
    </div>
  );
}
