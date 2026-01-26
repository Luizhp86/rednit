import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Configurar o workspace root para evitar conflito com package.json do diretório pai
  turbopack: {
    root: __dirname,
  },
  webpack: (config, { isServer }) => {
    // Garantir que o webpack resolve módulos a partir do diretório do projeto
    config.resolve.modules = [
      path.resolve(__dirname, "node_modules"),
      "node_modules",
    ];
    return config;
  },
};

export default nextConfig;
