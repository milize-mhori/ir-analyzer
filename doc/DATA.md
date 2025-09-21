
# データ一覧

## 1. データ構造定義

### 1.1 企業データ
```typescript
// 企業情報の型定義
interface Company {
  id: string;          // 一意識別子
  name: string;        // 企業名
  summary: string;     // IR要約テキスト
  type: 'base' | 'comparison'; // 基準企業 or 比較企業
}

// 企業リストの型定義
interface CompanyList {
  baseCompany: Company;      // 基準企業（必須）
  comparisonCompanies: Company[]; // 比較企業（1-4社）
}
```

### 1.2 プロンプトデータ
```typescript
// プロンプト情報の型定義
interface Prompt {
  id: string;          // 一意識別子
  name: string;        // プロンプト名
  content: string;     // プロンプト内容
  createdAt: Date;     // 作成日時
  updatedAt: Date;     // 更新日時
}

// プロンプトリストの型定義
interface PromptList {
  prompts: Prompt[];   // 保存済みプロンプト一覧
  selectedId?: string; // 現在選択中のプロンプトID
}
```

### 1.3 LLM設定データ
```typescript
// LLMモデル情報
interface LLMModel {
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
interface LLMConfig {
  models: LLMModel[];  // 利用可能モデル一覧
  selectedModelId: string; // 現在選択中のモデル
  apiKeys: Record<string, string>; // プロバイダー別APIキー
}
```

### 1.4 実行結果データ
```typescript
// 分析実行結果
interface AnalysisResult {
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
```

### 1.5 アプリケーション状態データ
```typescript
// 現在のタブ状態
type TabType = 'summary' | 'prompt' | 'result';

// アプリケーション状態
interface AppState {
  currentTab: TabType;
  companies: CompanyList;
  currentPrompt: Prompt | null;
  savedPrompts: PromptList;
  llmConfig: LLMConfig;
  currentResult: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;
}
```

## 2. ローカルストレージデータ

### 2.1 保存キー定義
```typescript
// ローカルストレージキー
const LOCAL_STORAGE_KEYS = {
  SAVED_PROMPTS: 'ir-analyzer-prompts',
  LLM_SETTINGS: 'ir-analyzer-llm-settings',
  RECENT_COMPANIES: 'ir-analyzer-recent-companies', // Phase 3
} as const;
```

### 2.2 プロンプト保存データ
```typescript
// ローカルストレージに保存するプロンプトデータ
interface SavedPromptsData {
  version: string;     // データバージョン
  prompts: Prompt[];   // プロンプト一覧
  lastUpdated: Date;   // 最終更新日時
}
```

### 2.3 設定保存データ
```typescript
// ローカルストレージに保存する設定データ
interface SavedSettingsData {
  version: string;     // データバージョン
  selectedModelId: string; // 選択中のモデル
  lastUpdated: Date;   // 最終更新日時
}
```

## 3. API データ

### 3.1 Azure OpenAI API リクエスト
```typescript
// Azure OpenAI API リクエスト形式
interface AzureOpenAIRequest {
  messages: {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
}
```

### 3.2 Azure OpenAI API レスポンス
```typescript
// Azure OpenAI API レスポンス形式
interface AzureOpenAIResponse {
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
```

### 3.3 Gemini API リクエスト
```typescript
// Gemini API リクエスト形式
interface GeminiRequest {
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
```

### 3.4 Gemini API レスポンス
```typescript
// Gemini API レスポンス形式
interface GeminiResponse {
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
```

### 3.5 内部API リクエスト/レスポンス
```typescript
// 内部API リクエスト（フロントエンド → バックエンド）
interface AnalysisRequest {
  companies: CompanyList;
  prompt: string;      // 置換済みプロンプト
  modelId: string;     // 使用モデルID
}

// 内部API レスポンス（バックエンド → フロントエンド）
interface AnalysisResponse {
  success: boolean;
  result?: string;     // 分析結果
  usage?: {
    inputTokens: number;
    outputTokens: number;
    estimatedCost: number;
  };
  error?: string;      // エラーメッセージ
}
```

## 4. デフォルトデータ

### 4.1 初期プロンプトテンプレート
```typescript
const DEFAULT_PROMPTS: Prompt[] = [
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
```

### 4.2 LLMモデル設定
```typescript
const DEFAULT_LLM_MODELS: LLMModel[] = [
  {
    id: 'azure-gpt-4o',
    name: 'Azure GPT-4o',
    provider: 'azure-openai',
    modelName: 'gpt-4o',
    deploymentName: 'gpt-4o',
    maxTokens: 4096,
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
    deploymentName: 'gpt-4o-mini',
    maxTokens: 16384,
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
    maxTokens: 8192,
    pricing: {
      input: 0.000075, // $0.000075 per 1K tokens
      output: 0.0003,  // $0.0003 per 1K tokens
    },
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'gemini',
    modelName: 'gemini-1.5-pro',
    maxTokens: 8192,
    pricing: {
      input: 0.00125, // $0.00125 per 1K tokens
      output: 0.005,  // $0.005 per 1K tokens
    },
  },
  {
    id: 'summary-comparison-v1',
    name: '要約比較v1',
    content: `# 命令:
注力事業ついて、まとめてください。

# 制約条件:
・具体的な取り組みがあれば含める
・先進的な取り組み、独自の取り組みがあれば含める
・多様な側面から関連する取り組みを網羅する
・目標値や達成値を数字で表現している記載があれば含める

{summary_list}

# 要約指示
基準企業：{base_corp_name}
比較企業：{comparison_corp_names}

注力事業について、以下の観点のレポートを作成してください
1.基準企業と比較企業（少なくとも一社）とで共通する取り組み
2.基準企業と比較企業（少なくとも一社）で特徴的な差異を表す取り組み
3.基準企業を除いた比較企業間のみで共通する取り組み
4.全体のまとめ

# 制約条件:
・2000文字程度でまとめる
・記載内容には、実際の取り組み内容や見通しなどを含めて、具体性を持たせる
・各企業の各文末には参照元のページ数が記載されているので、要約の参照元を企業を表す英字：ページ数の形式で要約の末尾に付加する（例　A:12, B:10）`,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

// 使用可能なプロンプト変数形式
const PROMPT_VARIABLES = {
  // 新形式（推奨）
  baseCompany: '{baseCompany}',               // 基準企業の情報（企業名 + 要約）
  comparisonCompanies: '{comparisonCompanies}', // 比較企業の情報（全企業の名前 + 要約）
  
  // 詳細形式
  base_corp_name: '{base_corp_name}',         // 基準企業名のみ
  base_corp_summary: '{base_corp_summary}',   // 基準企業要約のみ
  comp1_corp_name: '{comp1_corp_name}',       // 比較企業1の企業名のみ
  comp1_corp_summary: '{comp1_corp_summary}', // 比較企業1の要約のみ
  // comp2, comp3, comp4も同様...
  
  // 統合形式
  summary_list: '{summary_list}',             // 全企業の要約をリスト形式で統合
  comparison_corp_names: '{comparison_corp_names}', // 比較企業名をカンマ区切りで列挙
  
  // 旧形式（後方互換性のため保持）
  基準企業: '{基準企業}',                     // 基準企業の情報
  比較企業1: '{比較企業1}',                   // 比較企業1の情報
  比較企業2: '{比較企業2}',                   // 比較企業2の情報
  比較企業3: '{比較企業3}',                   // 比較企業3の情報
  比較企業4: '{比較企業4}',                   // 比較企業4の情報
} as const;
```

## 5. データフロー

### 5.1 データの流れ
```
1. ユーザー入力
   ↓
2. React State (一時保存)
   ↓
3. バリデーション
   ↓
4. Local Storage (プロンプトのみ永続化)
   ↓
5. API 送信 (実行時)
   ↓
6. 結果表示
```

### 5.2 状態管理の責任範囲
- **useState**: コンポーネント内の一時的な状態
- **カスタムフック**: 複数コンポーネント間での状態共有
- **Local Storage**: プロンプトの永続化
- **API**: LLM実行とレスポンス取得

## 6. 実装優先度

### Phase 1 (MVP)
- [x] Company, CompanyList 型定義
- [ ] 基本的な AppState 管理
- [ ] OpenAI API 連携データ構造
- [ ] 基本的なプロンプト管理

### Phase 2
- [ ] Prompt, PromptList 完全実装
- [ ] Local Storage データ管理
- [ ] AnalysisResult 完全実装
- [ ] 複数LLM対応データ構造

### Phase 3
- [ ] データバージョニング
- [ ] データ移行機能
- [ ] 詳細な使用量追跡
- [ ] パフォーマンス最適化
