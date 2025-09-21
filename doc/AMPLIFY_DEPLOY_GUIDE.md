# AWS Amplifyデプロイ手順書

## 📋 前提条件

### 必要なツール
- [x] AWS CLI設定済み
- [x] Amplify CLI インストール
- [x] GitHubアカウント
- [x] 実装済みのNext.jsアプリケーション

### 確認コマンド
```bash
# AWS CLI確認
aws --version
aws configure list

# Amplify CLI確認
amplify --version
```

## 🚀 デプロイ手順

### Step 1: GitHubリポジトリ作成・プッシュ

#### 1.1 GitHubでリポジトリ作成
1. GitHub（https://github.com）にログイン
2. 「New repository」をクリック
3. リポジトリ名: `ir-analyzer` (推奨)
4. Description: `IR関連資料比較分析システム`
5. Public/Private選択
6. 「Create repository」

#### 1.2 ローカルからGitHubへプッシュ
```bash
# リモートリポジトリ追加
cd /Users/mhori/10_develop/30_FGL/ir-analyzer
git remote add origin https://github.com/YOUR_USERNAME/ir-analyzer.git

# メインブランチにプッシュ
git branch -M main
git push -u origin main
```

### Step 2: AWS Amplifyアプリ作成

#### 2.1 Amplifyコンソールにアクセス
1. AWS Management Console にログイン
2. 「Amplify」サービスを検索・選択
3. 「New app」→ 「Host web app」

#### 2.2 ソース接続設定
1. 「GitHub」を選択
2. GitHubアカウント認証
3. 作成したリポジトリ（`ir-analyzer`）を選択
4. ブランチ：`main`を選択
5. 「Next」

#### 2.3 ビルド設定
1. App name: `ir-analyzer` 
2. Environment name: `prod`
3. Build settings確認（自動検出）:

```yaml
version: 1
backend:
  phases:
    build:
      commands:
        - '# Execute Amplify CLI with the helper script'
        - amplifyPush --simple
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

4. 「Next」

#### 2.4 デプロイ実行
1. 設定確認
2. 「Save and deploy」

### Step 3: 環境変数設定

#### 3.1 Amplifyコンソールで環境変数追加
1. デプロイ完了後、Amplifyアプリを選択
2. 左メニュー「Environment variables」
3. 「Manage variables」

#### 3.2 必要な環境変数
```
# 必須環境変数
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=IR関連資料比較分析システム
NEXT_PUBLIC_APP_VERSION=1.0.0

# OpenAI API（Phase 2で必要）
OPENAI_API_KEY=your_openai_api_key_here
```

#### 3.3 再デプロイ
1. 環境変数設定後
2. 「Redeploy this version」

## ✅ デプロイ完了確認

### 確認項目
- [ ] ビルド成功（約3-5分）
- [ ] デプロイURL生成
- [ ] アプリケーション正常表示
- [ ] レスポンシブデザイン動作
- [ ] タブナビゲーション動作
- [ ] LLMモデル選択動作

### アクセスURL
デプロイ完了後のURL形式：
```
https://main.XXXXXXXXXX.amplifyapp.com
```

## 🔍 動作確認手順

### 1. メインページ確認
- [ ] ヘッダー表示（タイトル + LLM選択）
- [ ] タブナビゲーション（3つのタブ）
- [ ] タブクリックで内容切り替え
- [ ] フッター情報表示
- [ ] TailwindCSSスタイル適用

### 2. テストページ確認
URL: `https://your-app.amplifyapp.com/test-components`
- [ ] 全UIコンポーネント表示
- [ ] ボタン動作
- [ ] フォーム入力
- [ ] トースト表示
- [ ] ローディング表示

### 3. レスポンシブ確認
- [ ] モバイル表示（375px）
- [ ] タブレット表示（768px）
- [ ] デスクトップ表示（1024px+）

## 🛠️ トラブルシューティング

### よくある問題

#### 1. ビルドエラー: "Module not found"
**解決方法:**
```bash
# 依存関係再インストール後再プッシュ
npm install
git add package-lock.json
git commit -m "fix: update dependencies"
git push
```

#### 2. 環境変数が反映されない
**解決方法:**
1. Amplifyコンソールで環境変数確認
2. 「Redeploy this version」実行

#### 3. CSS/TailwindCSSが適用されない
**解決方法:**
1. `globals.css`の記法確認
2. `tailwind.config.js`のパス設定確認
3. ビルドログでCSS関連エラー確認

#### 4. 画像最適化エラー
**設定済み対応:**
```javascript
// next.config.ts
images: {
  unoptimized: true,
}
```

## 📊 継続的デプロイ設定

### 自動デプロイ
- `main`ブランチへのpush → 自動デプロイ
- プルリクエストマージ → 自動デプロイ

### ブランチ戦略
```
main (本番環境)
├── develop (ステージング環境)
└── feature/* (開発ブランチ)
```

## 🔗 参考リンク

- [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
- [Amplify Documentation](https://docs.amplify.aws/)
- [Next.js on Amplify Guide](https://docs.amplify.aws/guides/hosting/nextjs/)

## 📝 デプロイ記録

| 日付 | バージョン | 主要変更 | デプロイURL |
|------|-----------|----------|-------------|
| 2024/XX/XX | v1.0.0 | Phase 1 完成 | https://main.xxx.amplifyapp.com |

---

**次回デプロイ時の改善予定:**
- [ ] ステージング環境の設定
- [ ] カスタムドメイン設定
- [ ] モニタリング・アラート設定
