'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { TabNavigation } from '@/components/TabNavigation';
import { useTabState } from '@/hooks/useTabState';
import { DEFAULT_LLM_MODELS } from '@/types';
import { Card } from '@/components/ui/Card';
import { SummaryInputTab } from '@/components/tabs/SummaryInputTab';
import { PromptTab } from '@/components/tabs/PromptTab';
import { ResultTab } from '@/components/tabs/ResultTab';
import { useCompanies } from '@/hooks/useCompanies';
import { useLLM } from '@/hooks/useLLM';

export default function Home() {
  const { currentTab, switchTab, canNavigateToTab, getTabStatus } = useTabState();
  const [selectedModelId, setSelectedModelId] = useState(DEFAULT_LLM_MODELS[0].id);
  
  // 企業データ管理
  const companiesHook = useCompanies();
  
  // LLM実行管理
  const { isLoading, error, result, executeAnalysis, clearResult } = useLLM();

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

              // 分析実行
              const result = await executeAnalysis(
                companiesHook.companies,
                prompt,
                selectedModel
              );

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

              await executeAnalysis(
                result.companies,
                result.prompt,
                selectedModel
              );
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
    </div>
  );
}