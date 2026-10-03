// Lokasi file: app/robots.js
// Aturan untuk mesin pencari (Google dll): boleh membaca halaman toko,
// tidak perlu membaca panel admin, troli, dan checkout.

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/troli", "/checkout"],
      },
    ],
    sitemap: "https://www.sinarkasih.co.id/sitemap.xml",
  };
}
