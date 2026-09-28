import Link from "next/link";
import { getSupabase } from "../../lib/supabase";

export const dynamic = "force-dynamic";

export default async function Page() {
  const supabase = getSupabase();

  let categories = [];
  let errorMessage = null;

  if (supabase) {
    const { data, error } = await supabase
      .from("kategori")
      .select("id, nama, slug, deskripsi, parent_id")
      .eq("aktif", true)
      .order("urutan", { ascending: true })
      .order("nama", { ascending: true });

    if (error) {
      console.error("SUPABASE KATEGORI ERROR:", error);
      errorMessage = error.message;
    } else {
      categories = data || [];
    }
  } else {
    errorMessage = "Koneksi Supabase belum tersedia.";
  }

  return (
    <section className="section">
      <div className="wrap">
        <h1>Kategori Produk</h1>

        {errorMessage ? (
          <div className="notice">
            <b>Koneksi database:</b> {errorMessage}
          </div>
        ) : categories.length === 0 ? (
          <div className="notice">
            Belum ada kategori aktif di database.
          </div>
        ) : (
          <div className="list">
            {categories.map((category) => (
              <Link
                href={`/cari?q=${encodeURIComponent(category.nama)}`}
                key={category.id}
              >
                {category.nama} →
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
