import { getSupabase } from "../lib/supabase";

export default async function Home() {
  const supabase = getSupabase();

  let products = [];
  let errorMessage = null;

  if (supabase) {
    const { data, error } = await supabase
      .from("produk")
      .select("id, nama, deskripsi")
      .eq("aktif", true)
      .order("id", { ascending: true });

    if (error) {
      console.error("SUPABASE PRODUK ERROR:", error);
      errorMessage = error.message;
    } else {
      products = data || [];
    }
  } else {
    errorMessage = "Koneksi Supabase belum tersedia.";
  }

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <p>
            <b>TOKO LISTRIK SINAR KASIH</b>
          </p>

          <h1>Kebutuhan listrik, lampu & perlengkapan rumah.</h1>

          <p>
            Temukan berbagai kebutuhan listrik dan perlengkapan rumah
            dengan mudah.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2>Produk Dari Database</h2>

          {errorMessage ? (
            <div className="notice">
              <b>Koneksi database:</b> {errorMessage}
            </div>
          ) : products.length === 0 ? (
            <div className="notice">
              Belum ada produk aktif di database.
            </div>
          ) : (
            <div className="cards">
              {products.map((product) => (
                <div className="card" key={product.id}>
                  <div className="img">
                    Foto Produk
                  </div>

                  <h3>{product.nama}</h3>

                  {product.deskripsi && (
                    <p>{product.deskripsi}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
