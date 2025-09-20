// LLM分析APIルート
import { NextRequest, NextResponse } from 'next/server';
import { 
  AzureOpenAIClient, 
  GeminiClient, 
  convertToAzureOpenAIRequest, 
  convertToGeminiRequest,
  normalizeAzureOpenAIResponse,
  normalizeGeminiResponse,
  UnifiedLLMResponse,
  LLMAPIError,
  validateLLMConfiguration
} from '@/utils/llm-clients';
import { AnalysisRequest, AnalysisResponse, LLMModel, DEFAULT_LLM_MODELS } from '@/types';

// プロンプト内の動的変数を企業データで置換
function replacePromptVariables(prompt: string, companies: AnalysisRequest['companies']): string {
  let replacedPrompt = prompt;

  // 基準企業の置換
  replacedPrompt = replacedPrompt.replace(
    /{基準企業}/g,
    `【${companies.baseCompany.name}】\n${companies.baseCompany.summary}`
  );

  // 比較企業の置換
  companies.comparisonCompanies.forEach((company, index) => {
    const placeholder = `{比較企業${index + 1}}`;
    const replacement = `【${company.name}】\n${company.summary}`;
    replacedPrompt = replacedPrompt.replace(new RegExp(placeholder, 'g'), replacement);
  });

  // 空の比較企業プレースホルダーを削除
  for (let i = companies.comparisonCompanies.length + 1; i <= 4; i++) {
    replacedPrompt = replacedPrompt.replace(new RegExp(`{比較企業${i}}`, 'g'), '');
  }

  return replacedPrompt;
}

// 使用料金の計算
function calculateCost(usage: UnifiedLLMResponse['usage'], model: LLMModel): number {
  const inputCost = (usage.inputTokens / 1000) * model.pricing.input;
  const outputCost = (usage.outputTokens / 1000) * model.pricing.output;
  return inputCost + outputCost;
}

// LLM実行関数
async function executeLLMRequest(
  modelId: string, 
  prompt: string
): Promise<UnifiedLLMResponse> {
  const model = DEFAULT_LLM_MODELS.find(m => m.id === modelId);
  if (!model) {
    throw new LLMAPIError(`モデル ${modelId} が見つかりません`, 'azure-openai');
  }

  try {
    if (model.provider === 'azure-openai') {
      const client = new AzureOpenAIClient();
      if (!client.isConfigured()) {
        throw new LLMAPIError('Azure OpenAI API が設定されていません', 'azure-openai');
      }

      const request = convertToAzureOpenAIRequest(prompt, model.maxTokens);
      const response = await client.chat(model.modelName, request);
      return normalizeAzureOpenAIResponse(response);

    } else if (model.provider === 'gemini') {
      const client = new GeminiClient();
      if (!client.isConfigured()) {
        throw new LLMAPIError('Gemini API が設定されていません', 'gemini');
      }

      const request = convertToGeminiRequest(prompt, model.maxTokens);
      const response = await client.generateContent(model.modelName, request);
      return normalizeGeminiResponse(response, model.modelName);

    } else {
      throw new LLMAPIError(`サポートされていないプロバイダー: ${model.provider}`, 'azure-openai');
    }
  } catch (error) {
    if (error instanceof LLMAPIError) {
      throw error;
    }
    
    console.error('LLM API実行エラー:', error);
    throw new LLMAPIError(
      `LLM API実行中にエラーが発生しました: ${error instanceof Error ? error.message : 'Unknown error'}`,
      model.provider,
      undefined,
      error
    );
  }
}

// POST /api/analyze
export async function POST(request: NextRequest) {
  try {
    // リクエストボディの解析
    const body: AnalysisRequest = await request.json();
    const { companies, prompt, modelId } = body;

    // バリデーション
    if (!companies || !prompt || !modelId) {
      return NextResponse.json(
        { 
          success: false, 
          error: '必要なパラメータが不足しています (companies, prompt, modelId)' 
        } as AnalysisResponse,
        { status: 400 }
      );
    }

    // LLM設定の確認
    const config = validateLLMConfiguration();
    if (!config.hasAnyProvider) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'LLM APIが設定されていません。環境変数を確認してください。' 
        } as AnalysisResponse,
        { status: 500 }
      );
    }

    // 選択されたモデルの確認
    const selectedModel = DEFAULT_LLM_MODELS.find(m => m.id === modelId);
    if (!selectedModel) {
      return NextResponse.json(
        { 
          success: false, 
          error: `モデル ${modelId} が見つかりません` 
        } as AnalysisResponse,
        { status: 400 }
      );
    }

    // プロバイダー設定の確認
    if (selectedModel.provider === 'azure-openai' && !config.azureOpenAI) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Azure OpenAI APIが設定されていません' 
        } as AnalysisResponse,
        { status: 500 }
      );
    }

    if (selectedModel.provider === 'gemini' && !config.gemini) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Gemini APIが設定されていません' 
        } as AnalysisResponse,
        { status: 500 }
      );
    }

    // プロンプトの動的変数置換
    const processedPrompt = replacePromptVariables(prompt, companies);

    // LLM実行
    const llmResponse = await executeLLMRequest(modelId, processedPrompt);

    // 使用料金計算
    const estimatedCost = calculateCost(llmResponse.usage, selectedModel);

    // レスポンス
    const response: AnalysisResponse = {
      success: true,
      result: llmResponse.content,
      usage: {
        inputTokens: llmResponse.usage.inputTokens,
        outputTokens: llmResponse.usage.outputTokens,
        estimatedCost,
      },
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Analysis API エラー:', error);

    if (error instanceof LLMAPIError) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message 
        } as AnalysisResponse,
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: '分析実行中にエラーが発生しました' 
      } as AnalysisResponse,
      { status: 500 }
    );
  }
}

// GET /api/analyze - 設定状況確認用
export async function GET() {
  try {
    const config = validateLLMConfiguration();
    
    return NextResponse.json({
      status: 'ok',
      providers: {
        'azure-openai': config.azureOpenAI,
        'gemini': config.gemini,
      },
      availableModels: DEFAULT_LLM_MODELS.filter(model => {
        if (model.provider === 'azure-openai') return config.azureOpenAI;
        if (model.provider === 'gemini') return config.gemini;
        return false;
      }),
    });
  } catch (error) {
    console.error('設定確認エラー:', error);
    return NextResponse.json(
      { error: '設定確認中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
