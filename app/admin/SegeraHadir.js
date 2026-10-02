// Lokasi file: app/admin/SegeraHadir.js
// Tampilan rapi untuk menu admin yang masih disiapkan.

export default function SegeraHadir({ judul, deskripsi, rencana = [] }) {
  return (
    <div className="sh">
      <div className="admin-page-header">
        <div>
          <h1>{judul}</h1>
          <p>{deskripsi}</p>
        </div>
      </div>

      <div className="sh-kartu">
        <span className="sh-label">Sedang disiapkan</span>
        <h2>Menu ini belum bisa digunakan</h2>
        <p className="sh-teks">
          Fitur berikut akan tersedia di menu ini setelah selesai dibuat:
        </p>

        <ul>
          {rencana.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>

      <style>{`
        .sh-kartu {
          background: #ffffff;
          border: 1px solid #eadfce;
          border-radius: 14px;
          padding: 28px;
          max-width: 640px;
        }

        .sh-label {
          display: inline-block;
          margin-bottom: 12px;
          padding: 4px 10px;
          border-radius: 999px;
          background: #fdf0e1;
          color: #9a5b16;
          font-size: 12.5px;
          font-weight: 700;
        }

        .sh-teks {
          margin: 6px 0 14px;
          color: #7d6957;
          font-size: 14.5px;
        }

        .sh-kartu ul {
          margin: 0;
          padding-left: 20px;
          color: #3f2f24;
          font-size: 14.5px;
          line-height: 1.8;
        }
      `}</style>
    </div>
  );
}
