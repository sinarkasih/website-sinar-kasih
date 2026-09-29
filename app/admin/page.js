\export default function Page() {
  return (
    <>
      <h1>Dashboard</h1>

      <div className="notice">
        Kerangka awal. Data dan hak akses akan dihubungkan ke Supabase pada tahap berikutnya.
      </div>

      <div className="kpis">
        {[
          "Total Produk",
          "Kategori",
          "Brand",
          "Pesanan",
          "Pengunjung",
          "WhatsApp",
        ].map((x) => (
          <div className="kpi" key={x}>
            <span>{x}</span>
            <b>0</b>
          </div>
        ))}
      </div>
    </>
  );
}
