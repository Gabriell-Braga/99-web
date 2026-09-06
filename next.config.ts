import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** O indicador de rota do Next não faz parte da interface do conceito. */
  devIndicators: false,
  turbopack: {
    rules: {
      // Ícones do Material Symbols importados como componente React.
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;
