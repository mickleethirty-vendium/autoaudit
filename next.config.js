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
      // These names were exposed in the production sitemap from 85abe6c.
      { source: "/small-cars-uk", destination: "/best-small-cars-uk", permanent: true },
      { source: "/reliable-used-cars-uk", destination: "/best-reliable-cars-uk", permanent: true },
      { source: "/family-cars-uk", destination: "/best-family-cars-uk", permanent: true },
    ];
  },
};

module.exports = nextConfig;
