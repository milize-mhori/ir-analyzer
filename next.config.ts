import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Amplify対応設定
  output: 'standalone',
  
  // 環境変数設定
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // 画像最適化設定（Amplifyでは制限あり）
  images: {
    unoptimized: true,
  },
  
  // Webpack設定でNode.jsモジュールの問題を解決
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // クライアントサイドでNode.jsモジュールを無効化
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }
    return config;
  },
  
  // サーバー外部パッケージ設定
  serverExternalPackages: [],
  
  // セキュリティヘッダー
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
