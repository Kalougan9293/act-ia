import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
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
