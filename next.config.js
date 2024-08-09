/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  experimental: {
    appDir: true,
  },
  trailingSlash: true,

  images: {
    domains: ["via.placeholder.com"],
  },
};

module.exports = nextConfig;
