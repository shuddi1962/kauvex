/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip ESLint during build to reduce memory usage on Vercel's 2-core/8GB machine
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Skip TypeScript checking during build (validated separately via tsc --noEmit)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Image optimization — allow external image sources
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
    // Use default loader for Vercel, unoptimized for static export on Netlify/others
    ...(process.env.NEXT_EXPORT === "true" ? { unoptimized: true } : {}),
  },

  // Ensure trailing slashes for compatibility across platforms
  trailingSlash: false,

  // Powered-by header removal for security
  poweredByHeader: false,

  // Enable React strict mode
  reactStrictMode: true,

  // Environment variables available at build time
  env: {
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME || "KAUVEX",
  },

  // Redirects
  async redirects() {
    return [
      {
        source: "/affiliate",
        destination: "/partners",
        permanent: false,
      },
      {
        source: "/influencer",
        destination: "/partners/register/influencer",
        permanent: false,
      },
    ];
  },

  // Security headers for all routes
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https: wss:; frame-src 'self' https:; media-src 'self' https:;" },
        ],
      },
    ];
  },
};

export default nextConfig;
