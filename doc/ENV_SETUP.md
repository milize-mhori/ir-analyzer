# 環境変数設定ガイド

## Azure OpenAI 認証方式

### 方式1: 従来のAPIキー認証
```env
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_API_KEY=your-azure-openai-api-key
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

### 方式2: ターゲットURI + キー認証（推奨・デモ用）
```env
AZURE_OPENAI_TARGET_URI=https://your-resource.openai.azure.com
AZURE_OPENAI_TARGET_KEY=your-azure-openai-target-key
AZURE_OPENAI_API_VERSION=2024-02-15-preview

# デプロイメント名（Azure OpenAIで作成したデプロイメント名）
AZURE_OPENAI_GPT4O_DEPLOYMENT=your-gpt4o-deployment-name
AZURE_OPENAI_GPT4O_MINI_DEPLOYMENT=your-gpt4o-mini-deployment-name
AZURE_OPENAI_GPT41_MINI_DEPLOYMENT=your-gpt41-mini-deployment-name
```

### 方式3: Azure AD認証（エンタープライズ用）
```env
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_AD_CLIENT_ID=your-azure-ad-client-id
AZURE_AD_CLIENT_SECRET=your-azure-ad-client-secret
AZURE_AD_TENANT_ID=your-azure-ad-tenant-id
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

## Google Gemini API
```env
GEMINI_API_KEY=your-gemini-api-key
```

## 認証方式の優先順位

1. **Azure AD認証** (最も安全)
2. **ターゲットキー認証** (デモ・開発用)
3. **従来のAPIキー認証** (後方互換性)

## デモ用設定（IP制限なし）

デモ用途でIP制限を回避したい場合は、**方式2のターゲットURI + キー認証**を使用してください：

```env
# デモ用設定例
AZURE_OPENAI_TARGET_URI=https://your-demo-resource.openai.azure.com
AZURE_OPENAI_TARGET_KEY=your-demo-target-key
AZURE_OPENAI_API_VERSION=2024-02-15-preview

# デプロイメント名（重要！）
AZURE_OPENAI_GPT4O_DEPLOYMENT=your-gpt4o-deployment-name
AZURE_OPENAI_GPT4O_MINI_DEPLOYMENT=your-gpt4o-mini-deployment-name
AZURE_OPENAI_GPT41_MINI_DEPLOYMENT=your-gpt41-mini-deployment-name

GEMINI_API_KEY=your-gemini-api-key
```

### デプロイメント名の確認方法

Azure OpenAI Studio で確認：
1. [Azure OpenAI Studio](https://oai.azure.com/) にアクセス
2. リソースを選択
3. **Deployments** タブでデプロイメント名を確認
4. 例：`gpt-4o`, `gpt-4o-mini`, `gpt-4.1-mini`, `my-custom-deployment` など

## 本番環境での注意事項

- **IP制限**: 本番環境では適切なIP制限を設定
- **キーローテーション**: 定期的なキーの更新
- **監査ログ**: アクセスログの監視
- **最小権限**: 必要最小限の権限のみ付与

## トラブルシューティング

### よくあるエラー

1. **401 Unauthorized**
   - APIキーまたはターゲットキーが正しいか確認
   - キーの有効期限を確認

2. **403 Forbidden**
   - IP制限の設定を確認
   - リソースへのアクセス権限を確認

3. **404 Not Found**
   - エンドポイントURLが正しいか確認
   - デプロイメント名が正しいか確認

### デバッグ方法

```typescript
// 認証方式の確認
const client = new AzureOpenAIClient();
console.log('認証方式:', client.getAuthMethod());
console.log('エンドポイント:', client.getEndpoint());
console.log('設定済み:', client.isConfigured());
```
