import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuração otimizada para produção
  experimental: {
    optimizePackageImports: ["react-icons", "leaflet", "react-leaflet"],
  },
};

export default nextConfig;
