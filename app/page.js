import { getSupabase } from "../lib/supabase";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = getSupabase();

  let products = [];
  let errorMessage = null;

  if (supabase) {
    const { data, error } = await supabase
      .from("produk")
      .select(`
        id,
        nama,
        deskripsi,
        produk_gambar (
          url,
          alt_text,
          utama
        ),
        harga_produk (
          mode_harga,
          harga,
          harga_min,
          harga_max,
          aktif
        )
      `)
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

          <h1>
            Kebutuhan listrik, lampu & perlengkapan rumah.
          </h1>

          <p>
            Temukan berbagai kebutuhan listrik dan
            perlengkapan rumah dengan mudah.
          </p>

          <a href="/kategori" className="btn">
            Belanja Produk
          </a>
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
              {products.map((product) => {
                const mainImage =
                  product.produk_gambar?.find(
                    (gambar) => gambar.utama
                  );

                const price =
                  product.harga_produk?.find(
                    (item) => item.aktif
                  );

                return (
                  <div
                    className="card"
                    key={product.id}
                  >
                    <a
                      href={`/produk/${product.id}`}
                      style={{
                        textDecoration: "none",
                        color: "inherit",
                      }}
                    >
                      <div className="img">
                        {mainImage?.url ? (
                          <img
                            src={mainImage.url}
                            alt={
                              mainImage.alt_text ||
                              product.nama
                            }
                          />
                        ) : (
                          "Foto Produk"
                        )}
                      </div>

                      {price?.mode_harga === "pasti" && (
                        <div className="price">
                          Rp{" "}
                          {Number(
                            price.harga || 0
                          ).toLocaleString("id-ID")}
                        </div>
                      )}

                      {price?.mode_harga === "range" && (
                        <div className="price">
                          Rp{" "}
                          {Number(
                            price.harga_min || 0
                          ).toLocaleString("id-ID")}
                          {" – "}
                          Rp{" "}
                          {Number(
                            price.harga_max || 0
                          ).toLocaleString("id-ID")}
                        </div>
                      )}

                      {price?.mode_harga === "mulai_dari" && (
                        <div className="price">
                          Mulai Rp{" "}
                          {Number(
                            price.harga_min ||
                              price.harga ||
                              0
                          ).toLocaleString("id-ID")}
                        </div>
                      )}

                      {price?.mode_harga === "hubungi" && (
                        <div className="price">
                          Hubungi kami
                        </div>
                      )}

                      {!price && (
                        <div className="price">
                          Harga tersedia
                        </div>
                      )}

                      <h3>{product.nama}</h3>

                      {product.deskripsi && (
                        <p>{product.deskripsi}</p>
                      )}
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
