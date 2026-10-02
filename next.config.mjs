/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Alamat lama /lainnya dipindah ke /info
      {
        source: "/lainnya",
        destination: "/info",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
