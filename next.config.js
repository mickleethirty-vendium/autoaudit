/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.autoaudit.uk",
          },
        ],
        destination: "https://autoaudit.uk/:path*",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;