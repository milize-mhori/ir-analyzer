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
  provider: 'openai' | 'anthropic' | 'google'; // プロバイダー
  apiEndpoint: string; // APIエンドポイント
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

// OpenAI API リクエスト形式
export interface OpenAIRequest {
  model: string;       // モデル名
  messages: {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
}

// OpenAI API レスポンス形式
export interface OpenAIResponse {
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

基準企業: {基準企業}

比較企業:
{比較企業1}
{比較企業2}
{比較企業3}
{比較企業4}

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
    content: `{基準企業}と以下の比較企業のSWOT分析を行ってください：

比較企業:
{比較企業1}
{比較企業2}
{比較企業3}
{比較企業4}

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
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'openai',
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    maxTokens: 8192,
    pricing: {
      input: 0.03,   // $0.03 per 1K tokens
      output: 0.06,  // $0.06 per 1K tokens
    },
  },
];
