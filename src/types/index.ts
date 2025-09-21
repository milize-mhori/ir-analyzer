// 企業データの型定義
export interface Company {
  id: string;          // 一意識別子
  name: string;        // 企業名
  summary: string;     // IR要約テキスト
  type: 'base' | 'comparison'; // 基準企業 or 比較企業
}

// 企業リストの型定義
export interface CompanyList {
  baseCompany: Company;      // 基準企業（必須）
  comparisonCompanies: Company[]; // 比較企業（1-4社）
}

// プロンプト情報の型定義
export interface Prompt {
  id: string;          // 一意識別子
  name: string;        // プロンプト名
  content: string;     // プロンプト内容
  createdAt: Date;     // 作成日時
  updatedAt: Date;     // 更新日時
}

// プロンプトリストの型定義
export interface PromptList {
  prompts: Prompt[];   // 保存済みプロンプト一覧
  selectedId?: string; // 現在選択中のプロンプトID
}

// LLMモデル情報
export interface LLMModel {
  id: string;          // モデルID
  name: string;        // 表示名
  provider: 'azure-openai' | 'gemini'; // プロバイダー
  modelName: string;   // 実際のモデル名
  deploymentName?: string; // Azure OpenAI デプロイメント名（Azure OpenAI用）
  maxTokens: number;   // 最大トークン数
  pricing: {
    input: number;     // 入力トークン単価
    output: number;    // 出力トークン単価
  };
}

// LLM設定
export interface LLMConfig {
  models: LLMModel[];  // 利用可能モデル一覧
  selectedModelId: string; // 現在選択中のモデル
  apiKeys: Record<string, string>; // プロバイダー別APIキー
}

// 分析実行結果
export interface AnalysisResult {
  id: string;          // 実行ID
  timestamp: Date;     // 実行日時
  model: LLMModel;     // 使用モデル
  prompt: {
    name: string;      // 使用プロンプト名
    content: string;   // 実際のプロンプト内容（置換後）
  };
  companies: CompanyList; // 使用した企業データ
  result: string;      // 分析結果テキスト
  usage: {
    inputTokens: number;  // 入力トークン数
    outputTokens: number; // 出力トークン数
    estimatedCost: number; // 推定料金
  };
  status: 'success' | 'error'; // 実行ステータス
  error?: string;      // エラーメッセージ（エラー時）
}

// 現在のタブ状態
export type TabType = 'summary' | 'prompt' | 'result';

// アプリケーション状態
export interface AppState {
  currentTab: TabType;
  companies: CompanyList;
  currentPrompt: Prompt | null;
  savedPrompts: PromptList;
  llmConfig: LLMConfig;
  currentResult: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;
}

// ローカルストレージキー
export const LOCAL_STORAGE_KEYS = {
  SAVED_PROMPTS: 'ir-analyzer-prompts',
  LLM_SETTINGS: 'ir-analyzer-llm-settings',
  RECENT_COMPANIES: 'ir-analyzer-recent-companies', // Phase 3
} as const;

// ローカルストレージに保存するプロンプトデータ
export interface SavedPromptsData {
  version: string;     // データバージョン
  prompts: Prompt[];   // プロンプト一覧
  lastUpdated: Date;   // 最終更新日時
}

// ローカルストレージに保存する設定データ
export interface SavedSettingsData {
  version: string;     // データバージョン
  selectedModelId: string; // 選択中のモデル
  lastUpdated: Date;   // 最終更新日時
}

// Azure OpenAI API リクエスト形式
export interface AzureOpenAIRequest {
  messages: {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
}

// Azure OpenAI API レスポンス形式
export interface AzureOpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Gemini API リクエスト形式
export interface GeminiRequest {
  contents: {
    parts: {
      text: string;
    }[];
  }[];
  generationConfig?: {
    temperature?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
}

// Gemini API レスポンス形式
export interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
    finishReason: string;
  }[];
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

// 内部API リクエスト（フロントエンド → バックエンド）
export interface AnalysisRequest {
  companies: CompanyList;
  prompt: string;      // 置換済みプロンプト
  modelId: string;     // 使用モデルID
}

// 内部API レスポンス（バックエンド → フロントエンド）
export interface AnalysisResponse {
  success: boolean;
  result?: string;     // 分析結果
  usage?: {
    inputTokens: number;
    outputTokens: number;
    estimatedCost: number;
  };
  error?: string;      // エラーメッセージ
}

// デフォルトプロンプトテンプレート
export const DEFAULT_PROMPTS: Prompt[] = [
  {
    id: 'default-comparison',
    name: '基本比較分析',
    content: `以下の企業のIR情報を比較分析してください：

基準企業: {baseCompany}

比較企業:
{comparisonCompanies}

以下の観点で比較分析を行い、共通点と差異を明確にしてください：
1. 事業戦略・方向性
2. 財務状況・業績
3. 市場環境認識
4. 今後の課題・リスク
5. 投資家への訴求ポイント`,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'swot-analysis',
    name: 'SWOT分析',
    content: `{baseCompany}と以下の比較企業のSWOT分析を行ってください：

比較企業:
{comparisonCompanies}

各企業について以下の4つの観点で分析し、最後に業界内での位置づけを比較してください：
- Strengths (強み)
- Weaknesses (弱み) 
- Opportunities (機会)
- Threats (脅威)`,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

// デフォルトLLMモデル設定
export const DEFAULT_LLM_MODELS: LLMModel[] = [
  {
    id: 'azure-gpt-4o',
    name: 'Azure GPT-4o',
    provider: 'azure-openai',
    modelName: 'gpt-4o',
    deploymentName: process.env.AZURE_OPENAI_GPT4O_DEPLOYMENT || 'gpt-4o',
    maxTokens: 4096,   // GPT-4oの最大出力トークン数
    pricing: {
      input: 0.0025,  // $0.0025 per 1K tokens
      output: 0.01,   // $0.01 per 1K tokens
    },
  },
  {
    id: 'azure-gpt-4o-mini',
    name: 'Azure GPT-4o Mini',
    provider: 'azure-openai',
    modelName: 'gpt-4o-mini',
    deploymentName: process.env.AZURE_OPENAI_GPT4O_MINI_DEPLOYMENT || 'gpt-4o-mini',
    maxTokens: 16384,  // GPT-4o Miniの最大出力トークン数
    pricing: {
      input: 0.00015, // $0.00015 per 1K tokens
      output: 0.0006, // $0.0006 per 1K tokens
    },
  },
  {
    id: 'azure-gpt-4.1-mini',
    name: 'Azure GPT-4.1 Mini',
    provider: 'azure-openai',
    modelName: 'gpt-4.1-mini',
    deploymentName: process.env.AZURE_OPENAI_GPT41_MINI_DEPLOYMENT || 'gpt-4.1-mini',
    maxTokens: 16384,  // GPT-4.1 Miniの最大出力トークン数
    pricing: {
      input: 0.00015, // $0.00015 per 1K tokens
      output: 0.0006, // $0.0006 per 1K tokens
    },
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'gemini',
    modelName: 'gemini-2.0-flash',
    maxTokens: 8192,   // Gemini 2.0 Flashの最大出力トークン数
    pricing: {
      input: 0.000075, // $0.000075 per 1K tokens (estimated)
      output: 0.0003, // $0.0003 per 1K tokens (estimated)
    },
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'gemini',
    modelName: 'gemini-1.5-pro',
    maxTokens: 8192,   // Gemini 1.5 Proの最大出力トークン数
    pricing: {
      input: 0.00125, // $0.00125 per 1K tokens
      output: 0.005, // $0.005 per 1K tokens
    },
  },
];
