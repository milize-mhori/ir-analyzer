# AWS Amplifyデプロイガイド

## 🚀 初回デプロイ手順

### 1. 前提条件
- AWS CLIの設定完了
- Amplify CLIのインストール
- GitHubリポジトリの準備

```bash
# Amplify CLIインストール
npm install -g @aws-amplify/cli

# AWS設定確認
aws configure list
```

### 2. Amplifyプロジェクト初期化

```bash
cd ir-analyzer

# Amplify初期化
amplify init

# 設定例:
# Project name: ir-analyzer
# Environment name: dev
# Default editor: Visual Studio Code
# App type: javascript
# Framework: react
# Source Directory Path: src
# Distribution Directory Path: .next
# Build Command: npm run build
# Start Command: npm run start
```

### 3. Amplifyホスティング設定

```bash
# ホスティング追加
amplify add hosting

# 設定例:
# Select the plugin module: Amazon CloudFront and S3
# Select the environment setup: PROD (S3 with CloudFront using HTTPS)
# hosting bucket name: ir-analyzer-hosting-bucket
```

### 4. 環境変数設定

Amplifyコンソールで以下の環境変数を設定:

```
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_APP_NAME=IR関連資料比較分析システム
NEXT_PUBLIC_APP_VERSION=1.0.0
NODE_ENV=production
```

### 5. デプロイ実行

```bash
# 初回デプロイ
amplify publish

# または継続的デプロイ用のGitHub連携
amplify add hosting
# → Amplify Console を選択
# → GitHubリポジトリを連携
```

## 🔄 継続的デプロイ

### GitHub連携設定
1. Amplifyコンソールにアクセス
2. アプリケーションを選択
3. 「Frontend environments」で「Connect branch」
4. GitHubリポジトリを選択
5. mainブランチを本番環境に設定

### 自動デプロイトリガー
- `main`ブランチへのpush → 本番環境デプロイ
- `develop`ブランチへのpush → ステージング環境デプロイ

## 🛠️ トラブルシューティング

### よくある問題と解決方法

#### 1. ビルドエラー: "Module not found"
```bash
# node_modulesの再インストール
rm -rf node_modules package-lock.json
npm install
```

#### 2. 環境変数が読み込まれない
```bash
# Amplifyコンソールで環境変数を確認
# 再デプロイが必要な場合がある
amplify publish --force
```

#### 3. 画像最適化エラー
```javascript
// next.config.ts で画像最適化を無効化済み
images: {
  unoptimized: true,
}
```

#### 4. API Routes 500エラー
- サーバーサイドログを確認
- 環境変数の設定を確認
- OpenAI APIキーの有効性を確認

## 📊 モニタリング

### Amplifyコンソールでの確認項目
1. **ビルドログ**: エラーやワーニングの確認
2. **アクセスログ**: トラフィック状況
3. **パフォーマンス**: ページ読み込み速度
4. **エラー率**: 4xx/5xxエラーの監視

### CloudWatch連携
- Lambda関数（API Routes）のログ
- エラー率の監視アラート設定
- カスタムメトリクスの追加

## 🔐 セキュリティ設定

### 実装済み設定
- セキュリティヘッダー（CSP、XSS対策）
- 環境変数による機密情報管理
- HTTPS強制

### 追加推奨設定
```bash
# WAF設定（オプション）
amplify add auth
amplify add function

# カスタムドメイン（オプション）
amplify add hosting
# → カスタムドメインを選択
```

## 📈 パフォーマンス最適化

### 実装済み最適化
- Next.js App Router使用
- Static Generation活用
- 画像最適化無効化（Amplify制限対応）

### 今後の最適化案
- CDNキャッシュ戦略の最適化
- バンドルサイズの削減
- レスポンス時間の改善

## 🚦 デプロイチェックリスト

### デプロイ前確認
- [ ] ローカルでビルド成功
- [ ] TypeScriptエラーなし
- [ ] リンターエラーなし
- [ ] 環境変数設定完了
- [ ] セキュリティ設定確認

### デプロイ後確認
- [ ] アプリケーション正常動作
- [ ] API Routes動作確認
- [ ] エラーログ確認
- [ ] パフォーマンス測定
- [ ] セキュリティヘッダー確認

## 🔗 参考リンク

- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [Next.js Deployment on Amplify](https://docs.amplify.aws/guides/hosting/nextjs/q/platform/js/)
- [Amplify CLI Documentation](https://docs.amplify.aws/cli/)
- [Amplify Console](https://console.aws.amazon.com/amplify/)
