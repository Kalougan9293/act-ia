import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // firebase-admin / jwks-rsa must stay external (CJS + jose dual build)
  serverExternalPackages: ["firebase-admin", "jwks-rsa", "jose"],
};

export default nextConfig;
