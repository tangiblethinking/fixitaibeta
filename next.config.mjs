/** @type {import('next').NextConfig} */
const nextConfig = {
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' blob: data: https:",
            "media-src 'self' blob:",
            "connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com https://upload.googleapis.com",
            "font-src 'self'",
            "frame-src 'self'",
          ].join('; '),
        },
      ],
    },
  ],
};

export default nextConfig;
