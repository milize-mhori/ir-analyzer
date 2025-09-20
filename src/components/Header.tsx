import React from 'react';
import { Select } from '@/components/ui/Select';
import { LLMModel } from '@/types';

interface HeaderProps {
  selectedModelId: string;
  availableModels: LLMModel[];
  onModelChange: (modelId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedModelId,
  availableModels,
  onModelChange,
}) => {
  const modelOptions = availableModels.map(model => ({
    value: model.id,
    label: model.name,
  }));

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* アプリタイトル */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">
                IR関連資料比較分析システム
              </h1>
            </div>
          </div>

          {/* ナビゲーション・設定エリア */}
          <div className="flex items-center space-x-4">
            {/* LLMモデル選択 */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                LLMモデル:
              </span>
              <div className="w-40">
                <Select
                  value={selectedModelId}
                  onChange={(e) => onModelChange(e.target.value)}
                  options={modelOptions}
                  placeholder="モデルを選択"
                  className="text-sm"
                />
              </div>
            </div>

            {/* バージョン情報（小さく表示） */}
            <div className="hidden md:block text-xs text-gray-500">
              v1.0.0
            </div>
          </div>
        </div>
      </div>

      {/* モバイル用の追加情報 */}
      <div className="sm:hidden bg-gray-50 px-4 py-2 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>LLM: {availableModels.find(m => m.id === selectedModelId)?.name || '未選択'}</span>
          <span>v1.0.0</span>
        </div>
      </div>
    </header>
  );
};
