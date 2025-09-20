'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { TabNavigation } from '@/components/TabNavigation';
import { useTabState } from '@/hooks/useTabState';
import { DEFAULT_LLM_MODELS } from '@/types';
import { Card } from '@/components/ui/Card';
import { SummaryInputTab } from '@/components/tabs/SummaryInputTab';

export default function Home() {
  const { currentTab, switchTab, canNavigateToTab, getTabStatus } = useTabState();
  const [selectedModelId, setSelectedModelId] = useState(DEFAULT_LLM_MODELS[0].id);

  const renderTabContent = () => {
    switch (currentTab) {
      case 'summary':
        return (
          <SummaryInputTab 
            onNext={() => switchTab('prompt')}
          />
        );
      
      case 'prompt':
        return (
          <Card title="分析プロンプト設定" subtitle="LLMに送信する分析プロンプトを設定してください">
            <div className="space-y-4">
              <div className="text-gray-600">
                ここにプロンプト入力コンポーネントが配置されます（T5で実装予定）
              </div>
              <div className="bg-green-50 p-4 rounded-md">
                <h4 className="font-medium text-green-900 mb-2">実装予定機能:</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• プロンプトテンプレートの選択</li>
                  <li>• カスタムプロンプトの入力</li>
                  <li>• 動的変数の置換プレビュー</li>
                  <li>• プロンプトの保存・読み込み</li>
                </ul>
              </div>
            </div>
          </Card>
        );
      
      case 'result':
        return (
          <Card title="分析結果" subtitle="LLMによる比較分析の結果を表示します">
            <div className="space-y-4">
              <div className="text-gray-600">
                ここに結果表示コンポーネントが配置されます（T7で実装予定）
              </div>
              <div className="bg-purple-50 p-4 rounded-md">
                <h4 className="font-medium text-purple-900 mb-2">実装予定機能:</h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• 分析結果の表示</li>
                  <li>• 使用量情報の表示</li>
                  <li>• 結果のコピー・保存機能</li>
                  <li>• 再実行機能</li>
                </ul>
              </div>
            </div>
          </Card>
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