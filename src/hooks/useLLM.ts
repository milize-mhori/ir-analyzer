import { useState, useCallback } from 'react';
import { AnalysisRequest, AnalysisResponse, AnalysisResult, CompanyList, LLMModel } from '@/types';

interface LLMExecutionState {
  isLoading: boolean;
  error: string | null;
  result: AnalysisResult | null;
}

export const useLLM = () => {
  const [state, setState] = useState<LLMExecutionState>({
    isLoading: false,
    error: null,
    result: null,
  });

  // 分析実行
  const executeAnalysis = useCallback(async (
    companies: CompanyList,
    prompt: { name: string; content: string },
    selectedModel: LLMModel
  ): Promise<AnalysisResult | null> => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      // API リクエスト準備
      const request: AnalysisRequest = {
        companies,
        prompt: prompt.content,
        modelId: selectedModel.id,
      };

      // API 呼び出し
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP Error: ${response.status}`);
      }

      const apiResponse: AnalysisResponse = await response.json();

      if (!apiResponse.success) {
        throw new Error(apiResponse.error || '分析実行に失敗しました');
      }

      // 結果オブジェクト作成
      const result: AnalysisResult = {
        id: `analysis-${Date.now()}`,
        timestamp: new Date(),
        model: selectedModel,
        prompt: {
          name: prompt.name,
          content: prompt.content,
        },
        companies,
        result: apiResponse.result || '',
        usage: {
          inputTokens: apiResponse.usage?.inputTokens || 0,
          outputTokens: apiResponse.usage?.outputTokens || 0,
          estimatedCost: apiResponse.usage?.estimatedCost || 0,
        },
        status: 'success',
      };

      setState(prev => ({
        ...prev,
        isLoading: false,
        result,
      }));

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '予期せぬエラーが発生しました';
      
      console.error('LLM実行エラー:', error);
      
      // エラー結果オブジェクト作成
      const errorResult: AnalysisResult = {
        id: `analysis-error-${Date.now()}`,
        timestamp: new Date(),
        model: selectedModel,
        prompt: {
          name: prompt.name,
          content: prompt.content,
        },
        companies,
        result: '',
        usage: {
          inputTokens: 0,
          outputTokens: 0,
          estimatedCost: 0,
        },
        status: 'error',
        error: errorMessage,
      };

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        result: errorResult,
      }));

      return null;
    }
  }, []);

  // エラーをクリア
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  // 結果をクリア
  const clearResult = useCallback(() => {
    setState(prev => ({
      ...prev,
      result: null,
      error: null,
    }));
  }, []);

  // 結果を再実行（同じパラメータで再実行）
  const reExecute = useCallback(async (): Promise<AnalysisResult | null> => {
    if (!state.result) {
      return null;
    }

    return executeAnalysis(
      state.result.companies,
      state.result.prompt,
      state.result.model
    );
  }, [state.result, executeAnalysis]);

  // API設定状況の確認
  const checkAPIStatus = useCallback(async (): Promise<{
    isConfigured: boolean;
    availableProviders: string[];
    availableModels: LLMModel[];
    error?: string;
  }> => {
    try {
      const response = await fetch('/api/analyze', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      
      const availableProviders = Object.entries(data.providers)
        .filter(([, isAvailable]) => isAvailable)
        .map(([provider]) => provider);

      return {
        isConfigured: availableProviders.length > 0,
        availableProviders,
        availableModels: data.availableModels || [],
      };

    } catch (error) {
      console.error('API設定確認エラー:', error);
      return {
        isConfigured: false,
        availableProviders: [],
        availableModels: [],
        error: error instanceof Error ? error.message : '設定確認に失敗しました',
      };
    }
  }, []);

  // 使用量統計の計算
  const getUsageStats = useCallback((results: AnalysisResult[]): {
    totalCost: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    successfulAnalyses: number;
    failedAnalyses: number;
  } => {
    return results.reduce(
      (stats, result) => ({
        totalCost: stats.totalCost + result.usage.estimatedCost,
        totalInputTokens: stats.totalInputTokens + result.usage.inputTokens,
        totalOutputTokens: stats.totalOutputTokens + result.usage.outputTokens,
        successfulAnalyses: stats.successfulAnalyses + (result.status === 'success' ? 1 : 0),
        failedAnalyses: stats.failedAnalyses + (result.status === 'error' ? 1 : 0),
      }),
      {
        totalCost: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        successfulAnalyses: 0,
        failedAnalyses: 0,
      }
    );
  }, []);

  return {
    isLoading: state.isLoading,
    error: state.error,
    result: state.result,
    executeAnalysis,
    clearError,
    clearResult,
    reExecute,
    checkAPIStatus,
    getUsageStats,
  };
};
