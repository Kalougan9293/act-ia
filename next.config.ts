import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Accès tablette / téléphone en Wi‑Fi (npm run dev -H 0.0.0.0)
  allowedDevOrigins: ["192.168.1.144"],
  // firebase-admin / jwks-rsa must stay external (CJS + jose dual build)
  serverExternalPackages: ["firebase-admin", "jwks-rsa", "jose"],
  async headers() {
    return [
      {
        source: "/:path*.mp4",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/media/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
