// Azure OpenAI と Gemini API クライアント

import { AzureOpenAIRequest, AzureOpenAIResponse, GeminiRequest, GeminiResponse } from '@/types';
import { AzureADAuth } from './azure-auth';

// Azure OpenAI クライアント
export class AzureOpenAIClient {
  private endpoint: string;
  private apiKey?: string;
  private apiVersion: string;
  private useAzureAD: boolean;
  private azureAuth?: AzureADAuth;

  constructor() {
    this.endpoint = process.env.AZURE_OPENAI_ENDPOINT || '';
    this.apiKey = process.env.AZURE_OPENAI_API_KEY;
    this.apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview';
    
    // Azure AD認証が利用可能かチェック
    this.useAzureAD = AzureADAuth.isConfigured() && !this.apiKey;
    
    if (this.useAzureAD) {
      try {
        this.azureAuth = new AzureADAuth();
      } catch (error) {
        console.warn('Azure AD認証の初期化に失敗:', error);
        this.useAzureAD = false;
      }
    }
  }

  async chat(deploymentName: string, request: AzureOpenAIRequest): Promise<AzureOpenAIResponse> {
    const url = `${this.endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${this.apiVersion}`;

    // 認証ヘッダーの準備
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.useAzureAD && this.azureAuth) {
      // Azure AD認証を使用
      try {
        const accessToken = await this.azureAuth.getAccessToken();
        headers['Authorization'] = `Bearer ${accessToken}`;
      } catch (error) {
        throw new Error(`Azure AD認証に失敗しました: ${error}`);
      }
    } else if (this.apiKey) {
      // APIキー認証を使用
      headers['api-key'] = this.apiKey;
    } else {
      throw new Error('Azure OpenAI の認証設定が不完全です（APIキーまたはAzure AD認証が必要）');
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Azure OpenAI API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  isConfigured(): boolean {
    return !!(this.endpoint && (this.apiKey || this.useAzureAD));
  }

  getAuthMethod(): 'api-key' | 'azure-ad' | 'none' {
    if (this.useAzureAD) return 'azure-ad';
    if (this.apiKey) return 'api-key';
    return 'none';
  }
}

// Gemini クライアント
export class GeminiClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  }

  async generateContent(modelName: string, request: GeminiRequest): Promise<GeminiResponse> {
    const url = `${this.baseUrl}/models/${modelName}:generateContent?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

// LLM レスポンス統一形式
export interface UnifiedLLMResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason: string;
}

// Azure OpenAI レスポンスを統一形式に変換
export function normalizeAzureOpenAIResponse(response: AzureOpenAIResponse): UnifiedLLMResponse {
  const choice = response.choices[0];
  return {
    content: choice.message.content,
    usage: {
      inputTokens: response.usage.prompt_tokens,
      outputTokens: response.usage.completion_tokens,
      totalTokens: response.usage.total_tokens,
    },
    model: response.model,
    finishReason: choice.finish_reason,
  };
}

// Gemini レスポンスを統一形式に変換
export function normalizeGeminiResponse(response: GeminiResponse, modelName: string): UnifiedLLMResponse {
  const candidate = response.candidates[0];
  const content = candidate.content.parts.map(part => part.text).join('');
  
  return {
    content,
    usage: {
      inputTokens: response.usageMetadata.promptTokenCount,
      outputTokens: response.usageMetadata.candidatesTokenCount,
      totalTokens: response.usageMetadata.totalTokenCount,
    },
    model: modelName,
    finishReason: candidate.finishReason,
  };
}

// プロンプトから各API形式へのコンバーター
export function convertToAzureOpenAIRequest(prompt: string, maxTokens?: number): AzureOpenAIRequest {
  return {
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: maxTokens,
    temperature: 0.7,
    top_p: 0.95,
  };
}

export function convertToGeminiRequest(prompt: string, maxTokens?: number): GeminiRequest {
  return {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: maxTokens,
    },
  };
}

// エラーハンドリング用のカスタムエラークラス
export class LLMAPIError extends Error {
  constructor(
    message: string,
    public provider: 'azure-openai' | 'gemini',
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'LLMAPIError';
  }
}

// API設定の検証
export function validateLLMConfiguration(): {
  azureOpenAI: boolean;
  gemini: boolean;
  hasAnyProvider: boolean;
} {
  const azureOpenAIClient = new AzureOpenAIClient();
  const geminiClient = new GeminiClient();
  
  const azureOpenAI = azureOpenAIClient.isConfigured();
  const gemini = geminiClient.isConfigured();
  
  return {
    azureOpenAI,
    gemini,
    hasAnyProvider: azureOpenAI || gemini,
  };
}
