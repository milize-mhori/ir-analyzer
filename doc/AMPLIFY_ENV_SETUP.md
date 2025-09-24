# Amplify環境変数設定ガイド

## 🎯 概要

Amplifyでは `env.local` の値をすべてコンソールから手動登録する必要はありません。
複数の方法で効率的に環境変数を設定できます。

## 🔧 設定方法の選択肢

### 方法1: Amplifyコンソール（推奨・最も簡単）

#### 手順:
1. AWS Amplify コンソール → アプリ選択
2. 「Environment variables」タブ
3. 「Manage variables」
4. 必要な環境変数を追加

#### 設定する環境変数:
```
AZURE_OPENAI_TARGET_URI=https://your-resource.openai.azure.com
AZURE_OPENAI_TARGET_KEY=your-target-key
AZURE_OPENAI_API_VERSION=2024-02-15-preview
AZURE_OPENAI_GPT4O_DEPLOYMENT=your-deployment-name
AZURE_OPENAI_GPT4O_MINI_DEPLOYMENT=your-mini-deployment
AZURE_OPENAI_GPT41_MINI_DEPLOYMENT=your-41-mini-deployment
GEMINI_API_KEY=your-gemini-key
```

#### メリット:
- ✅ 最も簡単
- ✅ ウェブUIで管理
- ✅ 即座に反映

### 方法2: amplify.yml + 環境変数（設定済み）

#### 現在の設定:
```yaml
preBuild:
  commands:
    # 環境変数をビルド時に自動設定
    - echo "AZURE_OPENAI_TARGET_URI=$AZURE_OPENAI_TARGET_URI" >> .env.production
    - echo "AZURE_OPENAI_TARGET_KEY=$AZURE_OPENAI_TARGET_KEY" >> .env.production
    # ... 他の環境変数
```

#### メリット:
- ✅ Gitでバージョン管理
- ✅ ビルド時に自動適用
- ✅ 複数環境対応

### 方法3: AWS Secrets Manager（企業・本番環境推奨）

#### 手順:
1. AWS Secrets Manager でシークレット作成
2. `amplify.yml` でシークレット取得を有効化:
```yaml
preBuild:
  commands:
    - aws secretsmanager get-secret-value --secret-id ir-analyzer-secrets --region ap-northeast-1 --query SecretString --output text | jq -r 'to_entries|map("\(.key)=\(.value)")|.[]' >> .env.production
```

#### メリット:
- ✅ 最高のセキュリティ
- ✅ キーローテーション対応
- ✅ アクセス制御

### ❌ 方法4: Amplify CLI（フロントエンドのみでは使用不可）

```bash
# ⚠️ 注意: フロントエンドのみのプロジェクトでは使用できません
# amplify env add production  # エラーになる
```

**理由:**
- 現在のプロジェクトはAmplify Hostingのみ
- `amplify init`されていない（バックエンドなし）
- Amplify CLIもインストールされていない

## ⚡ Amplifyでの環境変数の仕組み

### 🎯 **重要：コンソール設定だけで十分！**

実は、Amplifyコンソールで設定した環境変数は**直接**アプリケーションに渡されます。
`.env.production`ファイルを作る必要は**ありません**！

### 🔄 実際の動作フロー（シンプル）：

1. **Amplifyコンソール**で環境変数設定
2. **Git PUSH** → Amplifyが自動ビルド開始
3. **ビルド・実行時**に環境変数が直接利用可能
4. **Next.js**が`process.env.変数名`で直接アクセス

### 📋 設定方法の比較

#### ✅ **方法A: コンソールのみ（推奨・最もシンプル）**
- Amplifyコンソールで環境変数設定
- `amplify.yml`での追加設定不要
- 環境変数は自動的にアプリに適用

#### 🔧 **方法B: .env.productionファイル作成（特殊用途）**
- AWS Secrets Manager使用時
- 複雑な環境変数の加工が必要な場合
- 通常は不要

### 🚨 正しい理解
- ✅ **Amplifyコンソール設定のみで動作**
- ✅ **環境変数は直接アプリケーションに渡される**
- ❌ ~~`.env.production`ファイルが必要~~

## 🎯 推奨運用フロー（フロントエンドのみプロジェクト）

### 開発・テスト環境:
1. **方法1（Amplifyコンソール）** を使用
2. 簡単で迅速な設定変更が可能

### 本番環境:
1. **方法1（Amplifyコンソール）** または **方法3（AWS Secrets Manager）**
2. フロントエンドのみの場合、コンソール設定で十分

### 🚨 重要：現在のプロジェクト構成
- **Amplify Hosting のみ**（フロントエンド専用）
- **バックエンドリソースなし**
- **Amplify CLI環境管理は不要**

## ⚡ 設定後の確認

### 1. デプロイ後確認:
```bash
# Amplifyアプリのログ確認
# Environment variables が正しく設定されているか確認
```

### 2. アプリケーション確認:
- LLMモデル選択が動作するか
- Azure OpenAI API呼び出しが成功するか
- Gemini API呼び出しが成功するか

## 🔒 セキュリティ注意事項

### ❌ 避けるべき方法:
- `.env` ファイルのGitコミット
- プレーンテキストでの保存
- 不要な権限付与

### ✅ 推奨セキュリティ対策:
- 最小権限の原則
- 定期的なキーローテーション
- アクセスログの監視
- 環境別の権限分離

## 🚀 実践手順

### 初回設定（5分）:
1. Amplifyコンソールで環境変数設定
2. 「Redeploy this version」実行
3. アプリケーション動作確認

### 継続運用:
- 設定変更時のみAmplifyコンソール操作
- 通常のコード変更はGitプッシュのみ

## 📞 トラブルシューティング

### よくある問題:

#### 1. 環境変数が反映されない
**解決方法:**
- Amplifyコンソールで「Redeploy this version」
- 環境変数名のスペルチェック

#### 2. ビルドエラー
**解決方法:**
- `amplify.yml` の構文確認
- 必須環境変数の設定確認

#### 3. API接続エラー
**解決方法:**
- Azure OpenAI のエンドポイント・キー確認
- デプロイメント名の正確性確認

---

**結論: コンソールからの手動登録は不要です！効率的な方法を選択して使用してください。**
