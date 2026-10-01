"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getSupabase } from "../../lib/supabase";

export default function Page() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") === "brand"
    ? "brand"
    : "kategori";

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setErrorMessage("");

      const supabase = getSupabase();

      if (!supabase) {
        setErrorMessage(
          "Koneksi Supabase belum tersedia."
        );
        setLoading(false);
        return;
      }

      const [
        categoriesResult,
        brandsResult,
      ] = await Promise.all([
        supabase
          .from("kategori")
          .select(`
            id,
            nama,
            slug,
            deskripsi,
            parent_id,
            urutan,
            gambar_url
          `)
          .eq("aktif", true)
          .order("urutan", {
            ascending: true,
          })
          .order("nama", {
            ascending: true,
          }),

        supabase
          .from("brand")
          .select(`
            id,
            nama,
            slug,
            logo_url
          `)
          .eq("aktif", true)
          .order("nama", {
            ascending: true,
          }),
      ]);

      if (categoriesResult.error) {
        console.error(
          "SUPABASE KATEGORI ERROR:",
          categoriesResult.error
        );

        setErrorMessage(
          categoriesResult.error.message
        );
        setLoading(false);
        return;
      }

      if (brandsResult.error) {
        console.error(
          "SUPABASE BRAND ERROR:",
          brandsResult.error
        );

        setErrorMessage(
          brandsResult.error.message
        );
        setLoading(false);
        return;
      }

      setCategories(
        categoriesResult.data || []
      );

      setBrands(
        brandsResult.data || []
      );

      setLoading(false);
    }

    loadData();
  }, []);

  function changeTab(nextTab) {
    const url =
      nextTab === "brand"
        ? "/kategori?tab=brand"
        : "/kategori";

    window.history.pushState(
      {},
      "",
      url
    );

    window.dispatchEvent(
      new PopStateEvent("popstate")
    );
  }

  return (
    <section className="section">
      <div className="wrap">

        <h1>Kategori Produk</h1>

        <p
          style={{
            marginTop: "8px",
            color: "#6b6258",
          }}
        >
          Jelajahi produk berdasarkan kategori
          atau brand.
        </p>

        {/* TAB */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginTop: "24px",
            marginBottom: "24px",
            borderBottom:
              "1px solid #e2d7c8",
          }}
        >
          <button
            type="button"
            onClick={() =>
              changeTab("kategori")
            }
            style={{
              border: "none",
              background:
                tab === "kategori"
                  ? "#7a4f35"
                  : "#f5f0e8",
              color:
                tab === "kategori"
                  ? "#fff"
                  : "#4b3528",
              padding:
                "10px 18px",
              borderRadius:
                "10px 10px 0 0",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Kategori
          </button>

          <button
            type="button"
            onClick={() =>
              changeTab("brand")
            }
            style={{
              border: "none",
              background:
                tab === "brand"
                  ? "#7a4f35"
                  : "#f5f0e8",
              color:
                tab === "brand"
                  ? "#fff"
                  : "#4b3528",
              padding:
                "10px 18px",
              borderRadius:
                "10px 10px 0 0",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Brand
          </button>
        </div>

        {errorMessage ? (
          <div className="notice">
            <b>Koneksi database:</b>{" "}
            {errorMessage}
          </div>
        ) : loading ? (
          <div className="notice">
            Memuat data...
          </div>
        ) : tab === "brand" ? (
          <>
            <h2>
              Brand
            </h2>

            {brands.length === 0 ? (
              <div className="notice">
                Belum ada brand aktif.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(180px, 1fr))",
                  gap: "18px",
                  marginTop: "20px",
                }}
              >
                {brands.map((brand) => (
                  <article
                    key={brand.id}
                    style={{
                      background: "#fff",
                      border:
                        "1px solid #e2d7c8",
                      borderRadius: "14px",
                      padding: "16px",
                      minHeight: "160px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "90px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "12px",
                      }}
                    >
                      {brand.logo_url ? (
                        <img
                          src={brand.logo_url}
                          alt={brand.nama}
                          style={{
                            maxWidth: "100%",
                            maxHeight: "82px",
                            objectFit:
                              "contain",
                          }}
                        />
                      ) : (
                        <span
                          style={{
                            fontSize: "18px",
                            fontWeight: 800,
                            color: "#6f4a32",
                          }}
                        >
                          {brand.nama}
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "15px",
                        color: "#4b3528",
                      }}
                    >
                      {brand.nama}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <h2>
              Kategori
            </h2>

            {categories.length === 0 ? (
              <div className="notice">
                Belum ada kategori aktif.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(180px, 1fr))",
                  gap: "18px",
                  marginTop: "20px",
                }}
              >
                {categories.map(
                  (category) => (
                    <Link
                      href={`/kategori/${category.slug}`}
                      key={category.id}
                      style={{
                        textDecoration:
                          "none",
                        color: "inherit",
                      }}
                    >
                      <article
                        style={{
                          background: "#fff",
                          border:
                            "1px solid #e2d7c8",
                          borderRadius:
                            "14px",
                          padding: "14px",
                          minHeight:
                            "190px",
                        }}
                      >
                        <div
                          style={{
                            width: "100%",
                            height: "130px",
                            borderRadius:
                              "10px",
                            overflow:
                              "hidden",
                            background:
                              "#f5f0e8",
                            display: "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                          }}
                        >
                          {category.gambar_url ? (
                            <img
                              src={
                                category.gambar_url
                              }
                              alt={
                                category.nama
                              }
                              style={{
                                width:
                                  "100%",
                                height:
                                  "100%",
                                objectFit:
                                  "contain",
                              }}
                            />
                          ) : (
                            <span
                              style={{
                                color:
                                  "#8a7c6c",
                                fontSize:
                                  "14px",
                              }}
                            >
                              Belum ada gambar
                            </span>
                          )}
                        </div>

                        <div
                          style={{
                            marginTop:
                              "12px",
                            fontWeight: 700,
                            fontSize:
                              "16px",
                          }}
                        >
                          {category.nama}
                        </div>

                        {category.deskripsi && (
                          <div
                            style={{
                              marginTop:
                                "5px",
                              fontSize:
                                "13px",
                              color:
                                "#756b60",
                            }}
                          >
                            {
                              category.deskripsi
                            }
                          </div>
                        )}
                      </article>
                    </Link>
                  )
                )}
              </div>
            )}
          </>
        )}

      </div>
    </section>
  );
}
