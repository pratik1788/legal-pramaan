/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output keeps the Docker image small.
  output: "standalone",
  reactStrictMode: true,
  // @react-pdf/renderer pulls in browser shims; keep it server-only.
  experimental: {
    serverComponentsExternalPackages: ["@react-pdf/renderer"],
  },
};

module.exports = nextConfig;
