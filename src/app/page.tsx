'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { TabNavigation } from '@/components/TabNavigation';
import { useTabState } from '@/hooks/useTabState';
import { DEFAULT_LLM_MODELS } from '@/types';
import { SummaryInputTab } from '@/components/tabs/SummaryInputTab';
import { PromptTab } from '@/components/tabs/PromptTab';
import { ResultTab } from '@/components/tabs/ResultTab';
import { AnalysisLoadingModal } from '@/components/ui/AnalysisLoadingModal';
import { useCompanies } from '@/hooks/useCompanies';
import { useLLM } from '@/hooks/useLLM';

export default function Home() {
  const { currentTab, switchTab, canNavigateToTab, getTabStatus } = useTabState();
  const [selectedModelId, setSelectedModelId] = useState(DEFAULT_LLM_MODELS[0].id);
  
  // 企業データ管理
  const companiesHook = useCompanies();
  
  // LLM実行管理
  const { isLoading, error, result, executeAnalysis, clearResult } = useLLM();
  
  // ローディングモーダル用のステート
  const [currentAnalysisInfo, setCurrentAnalysisInfo] = useState<{
    companies: typeof companiesHook.companies;
    prompt: { name: string; content: string };
    model: typeof DEFAULT_LLM_MODELS[0];
  } | null>(null);

  const renderTabContent = () => {
    switch (currentTab) {
      case 'summary':
        return (
          <SummaryInputTab 
            onNext={() => switchTab('prompt')}
            companiesHook={companiesHook}
          />
        );
      
      case 'prompt':
        return (
          <PromptTab 
            onExecute={async (prompt) => {
              const selectedModel = DEFAULT_LLM_MODELS.find(m => m.id === selectedModelId);
              if (!selectedModel) {
                console.error('選択されたモデルが見つかりません');
                return;
              }

              // ローディングモーダル用の情報を設定
              setCurrentAnalysisInfo({
                companies: companiesHook.companies,
                prompt,
                model: selectedModel,
              });

              // 分析実行
              const result = await executeAnalysis(
                companiesHook.companies,
                prompt,
                selectedModel
              );

              // 分析完了後、ローディングモーダルを閉じる
              setCurrentAnalysisInfo(null);

              // 成功時は結果タブに遷移
              if (result) {
                switchTab('result');
              }
            }}
            onBack={() => switchTab('summary')}
            companiesHook={companiesHook}
          />
        );
      
      case 'result':
        return (
          <ResultTab
            result={result}
            isLoading={isLoading}
            error={error}
            onBack={() => switchTab('prompt')}
            onReExecute={async () => {
              const selectedModel = DEFAULT_LLM_MODELS.find(m => m.id === selectedModelId);
              if (!selectedModel || !result) return;

              // ローディングモーダル用の情報を設定
              setCurrentAnalysisInfo({
                companies: result.companies,
                prompt: result.prompt,
                model: selectedModel,
              });

              await executeAnalysis(
                result.companies,
                result.prompt,
                selectedModel
              );

              // 分析完了後、ローディングモーダルを閉じる
              setCurrentAnalysisInfo(null);
            }}
            onNewAnalysis={() => {
              clearResult();
              switchTab('summary');
            }}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <Header
        selectedModelId={selectedModelId}
        availableModels={DEFAULT_LLM_MODELS}
        onModelChange={setSelectedModelId}
      />

      {/* タブナビゲーション */}
      <TabNavigation
        currentTab={currentTab}
        onTabChange={switchTab}
        canNavigateToTab={canNavigateToTab}
        getTabStatus={getTabStatus}
      />

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </main>

      {/* フッター */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div>
              IR関連資料比較分析システム v1.0.0
            </div>
            <div>
              使用モデル: {DEFAULT_LLM_MODELS.find(m => m.id === selectedModelId)?.name}
            </div>
          </div>
        </div>
      </footer>

      {/* ローディングモーダル */}
      {currentAnalysisInfo && (
        <AnalysisLoadingModal
          isOpen={isLoading}
          companies={currentAnalysisInfo.companies}
          model={currentAnalysisInfo.model}
          prompt={currentAnalysisInfo.prompt}
          onCancel={() => {
            // キャンセル機能は必要に応じて実装
            console.log('分析をキャンセルしました');
            setCurrentAnalysisInfo(null);
          }}
        />
      )}
    </div>
  );
}