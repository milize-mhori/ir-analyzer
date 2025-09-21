import { ClientSecretCredential } from '@azure/identity';

/**
 * Azure AD認証クライアント
 * Azure OpenAI への認証にAzure ADトークンを使用
 */
export class AzureADAuth {
  private credential: ClientSecretCredential;
  private tokenCache: { token: string; expiresAt: number } | null = null;

  constructor() {
    const tenantId = process.env.AZURE_AD_TENANT_ID;
    const clientId = process.env.AZURE_AD_CLIENT_ID;
    const clientSecret = process.env.AZURE_AD_CLIENT_SECRET;

    if (!tenantId || !clientId || !clientSecret) {
      throw new Error('Azure AD認証に必要な環境変数が設定されていません');
    }

    this.credential = new ClientSecretCredential(
      tenantId,
      clientId,
      clientSecret
    );
  }

  /**
   * Azure OpenAI用のアクセストークンを取得
   * トークンキャッシュを使用して不要なAPIコールを削減
   */
  async getAccessToken(): Promise<string> {
    // キャッシュされたトークンが有効かチェック
    if (this.tokenCache && this.tokenCache.expiresAt > Date.now()) {
      return this.tokenCache.token;
    }

    try {
      // Azure Cognitive Services のスコープでトークン取得
      const tokenResponse = await this.credential.getToken(
        'https://cognitiveservices.azure.com/.default'
      );

      if (!tokenResponse) {
        throw new Error('Azure ADトークンの取得に失敗しました');
      }

      // トークンをキャッシュ（有効期限の90%の時間でキャッシュ）
      const expiresAt = tokenResponse.expiresOnTimestamp - (5 * 60 * 1000); // 5分前に期限切れとして扱う
      this.tokenCache = {
        token: tokenResponse.token,
        expiresAt: expiresAt,
      };

      return tokenResponse.token;
    } catch (error) {
      console.error('Azure AD認証エラー:', error);
      throw new Error('Azure AD認証に失敗しました');
    }
  }

  /**
   * トークンキャッシュをクリア
   */
  clearTokenCache(): void {
    this.tokenCache = null;
  }

  /**
   * 認証設定が有効かチェック
   */
  static isConfigured(): boolean {
    return !!(
      process.env.AZURE_AD_TENANT_ID &&
      process.env.AZURE_AD_CLIENT_ID &&
      process.env.AZURE_AD_CLIENT_SECRET
    );
  }
}

// シングルトンインスタンス
let azureAuthInstance: AzureADAuth | null = null;

/**
 * Azure AD認証インスタンスを取得
 */
export function getAzureAuth(): AzureADAuth {
  if (!azureAuthInstance) {
    azureAuthInstance = new AzureADAuth();
  }
  return azureAuthInstance;
}

