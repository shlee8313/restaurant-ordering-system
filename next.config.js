/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  experimental: {
    appDir: true,
  },
  trailingSlash: true,
  exportPathMap: async function (defaultPathMap, { dev, dir, outDir, distDir, buildId }) {
    const pathMap = { ...defaultPathMap };
    delete pathMap["/api/edit_menu"];
    delete pathMap["/api/menu"];
    delete pathMap["/api/restaurant"];
    delete pathMap["/api/sales"];
    delete pathMap["/api/sales/todaySales"];
    return pathMap;
  },
  images: {
    domains: ["via.placeholder.com"],
  },
};

module.exports = nextConfig;
