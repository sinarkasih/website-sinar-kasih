"use client";

// Lokasi file: app/info/VideoPromosi.js
// Video promosi Sinar Kasih dari YouTube.
// Video baru dimuat & diputar setelah pengunjung menekan tombol putar.

import { useState } from "react";

const TAMPIL_AWAL = 3;

export function ambilIdYoutube(url) {
  if (!url) return null;
  const pola = [
    /youtu\.be\/([\w-]{11})/,
    /youtube\.com\/watch\?[^#]*v=([\w-]{11})/,
    /youtube\.com\/(?:embed|shorts|live)\/([\w-]{11})/,
  ];
  for (const p of pola) {
    const m = String(url).match(p);
    if (m) return m[1];
  }
  return null;
}

function KartuVideo({ v }) {
  const [main, setMain] = useState(false);
  const id = ambilIdYoutube(v.youtube_url);
  if (!id) return null;

  return (
    <div className="vd-kartu">
      <div className="vd-layar">
        {main ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title={v.judul}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className="vd-sampul"
            onClick={() => setMain(true)}
            aria-label={`Putar video ${v.judul}`}
          >
            <img
              src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
              alt=""
              loading="lazy"
            />
            <span className="vd-tombol">
              <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5.5v13a1 1 0 0 0 1.5.9l10-6.5a1 1 0 0 0 0-1.7l-10-6.5A1 1 0 0 0 8 5.5Z" />
              </svg>
            </span>
          </button>
        )}
      </div>
      <div className="vd-isi">
        <strong>{v.judul}</strong>
        {v.keterangan && <span>{v.keterangan}</span>}
        <a
          href={v.youtube_url}
          target="_blank"
          rel="noopener noreferrer"
          className="vd-link"
        >
          Tonton &amp; bagikan di YouTube ↗
        </a>
      </div>
    </div>
  );
}

export default function VideoPromosi({ video }) {
  const [semua, setSemua] = useState(false);
  const daftar = semua ? video : video.slice(0, TAMPIL_AWAL);

  return (
    <>
      <div className="vd-grid">
        {daftar.map((v) => (
          <KartuVideo key={v.id} v={v} />
        ))}
      </div>
      {video.length > TAMPIL_AWAL && (
        <button
          type="button"
          className="pl-semua"
          onClick={() => setSemua(!semua)}
        >
          {semua ? "Tampilkan lebih sedikit" : `Lihat semua video (${video.length})`}
        </button>
      )}
    </>
  );
}
