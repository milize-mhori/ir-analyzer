# Azure AD認証セットアップガイド

## 1. Azure AD アプリケーション登録

### 1.1 Azureポータルでの設定
1. [Azure Portal](https://portal.azure.com) にログイン
2. **Azure Active Directory** → **アプリの登録** → **新規登録**
3. 以下の設定で登録：
   ```
   名前: ir-analyzer-app
   サポートされているアカウントの種類: この組織ディレクトリのみのアカウント
   リダイレクト URI: 
     - Web: https://your-amplify-domain.amplifyapp.com/api/auth/callback
     - ローカル開発用: http://localhost:3000/api/auth/callback
   ```

### 1.2 アプリケーション設定
登録後、以下の情報を控える：
- **アプリケーション (クライアント) ID**: `{CLIENT_ID}`
- **ディレクトリ (テナント) ID**: `{TENANT_ID}`

### 1.3 クライアントシークレット作成
1. **証明書とシークレット** → **新しいクライアント シークレット**
2. 説明: `ir-analyzer-secret`
3. 有効期限: 24か月
4. **値**を控える: `{CLIENT_SECRET}`

## 2. Azure OpenAI リソース設定

### 2.1 Azure OpenAI でのアクセス制御
1. Azure OpenAI リソース → **アクセス制御 (IAM)**
2. **ロールの割り当て** → **追加**
3. 以下のロールを割り当て：
   ```
   ロール: Cognitive Services OpenAI User
   アクセスの割り当て先: アプリケーション
   選択: ir-analyzer-app
   ```

### 2.2 ネットワーク設定更新
1. Azure OpenAI リソース → **ネットワーク**
2. **選択されたネットワークとプライベート エンドポイント**
3. **Azure AD認証を使用する場合は、IPアドレス範囲を拡張**または**すべてのネットワーク**に変更

## 3. 環境変数設定

### 3.1 .env.local 更新
```env
# Azure AD認証
AZURE_AD_CLIENT_ID={CLIENT_ID}
AZURE_AD_CLIENT_SECRET={CLIENT_SECRET}  
AZURE_AD_TENANT_ID={TENANT_ID}

# Azure OpenAI (URL は変更なし)
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_API_VERSION=2024-02-15-preview

# またはターゲットURI + キー認証（デモ用）
# AZURE_OPENAI_TARGET_URI=https://your-resource.openai.azure.com
# AZURE_OPENAI_TARGET_KEY=your-target-key

# Gemini (変更なし)
GEMINI_API_KEY=your-gemini-api-key

# NextAuth設定
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
```

### 3.2 本番環境 (Amplify)
Amplify Console → Environment variables で同様に設定

## 4. 実装コード

### 4.1 必要なパッケージ
```bash
npm install @azure/msal-node @azure/identity
```

### 4.2 Azure AD クライアント実装
```typescript
// src/utils/azure-auth.ts
import { ClientSecretCredential } from '@azure/identity';

export class AzureADAuth {
  private credential: ClientSecretCredential;

  constructor() {
    this.credential = new ClientSecretCredential(
      process.env.AZURE_AD_TENANT_ID!,
      process.env.AZURE_AD_CLIENT_ID!,
      process.env.AZURE_AD_CLIENT_SECRET!
    );
  }

  async getAccessToken(): Promise<string> {
    const tokenResponse = await this.credential.getToken(
      'https://cognitiveservices.azure.com/.default'
    );
    return tokenResponse.token;
  }
}
```

## 5. セキュリティ考慮事項

### 5.1 最小権限の原則
- Azure OpenAI リソースへの`User`ロールのみ付与
- 不要なAPIアクセス権は付与しない

### 5.2 トークン管理
- アクセストークンの自動リフレッシュ
- トークンの適切なキャッシュ
- エラーハンドリングの実装

### 5.3 監査とログ
- Azure AD サインインログの監視
- Azure OpenAI アクセスログの確認
- 異常なアクセスパターンのアラート設定
