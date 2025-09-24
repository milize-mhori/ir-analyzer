'use client';

import React, { useEffect, useState } from 'react';
import { LLMModel, CompanyList } from '@/types';

interface AnalysisLoadingModalProps {
  isOpen: boolean;
  companies: CompanyList;
  model: LLMModel;
  prompt: { name: string; content: string };
  onCancel?: () => void;
}

// 分析ステップの定義
const ANALYSIS_STEPS = [
  { id: 'prepare', label: 'プロンプト準備中', icon: '📝' },
  { id: 'llm', label: 'LLM分析実行中', icon: '🧠' },
  { id: 'process', label: '結果処理中', icon: '⚙️' },
  { id: 'complete', label: '完了', icon: '✅' }
];

export const AnalysisLoadingModal: React.FC<AnalysisLoadingModalProps> = ({
  isOpen,
  companies,
  model,
  prompt,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  // プログレスアニメーション
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setProgress(0);
      return;
    }

    const stepDuration = 2000; // 各ステップ2秒
    const totalSteps = ANALYSIS_STEPS.length - 1; // 最後のステップは完了なので除く

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (totalSteps * stepDuration / 50));
        
        // ステップ切り替え
        const newStep = Math.min(
          Math.floor(newProgress / (100 / totalSteps)),
          totalSteps - 1
        );
        setCurrentStep(newStep);

        return Math.min(newProgress, 99); // 99%まで（完了は外部制御）
      });
    }, 50);

    return () => clearInterval(progressInterval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-2xl">🚀</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">IR比較分析実行中</h2>
                <p className="text-blue-100 text-sm">LLMによる企業比較分析を実行しています</p>
              </div>
            </div>
            {onCancel && (
              <button
                onClick={onCancel}
                className="text-white hover:text-red-200 transition-colors p-2"
                title="キャンセル"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* プログレスバー */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">分析進行状況</span>
              <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-300 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white bg-opacity-30 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* ステップインジケーター */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-600">実行ステップ</h3>
            <div className="space-y-2">
              {ANALYSIS_STEPS.map((step, index) => (
                <div 
                  key={step.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                    index === currentStep 
                      ? 'bg-blue-50 border border-blue-200' 
                      : index < currentStep 
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className={`text-2xl transition-all duration-300 ${
                    index === currentStep ? 'animate-bounce' : ''
                  }`}>
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <span className={`text-sm font-medium ${
                      index === currentStep 
                        ? 'text-blue-700' 
                        : index < currentStep 
                          ? 'text-green-700'
                          : 'text-gray-500'
                    }`}>
                      {step.label}
                    </span>
                    {index === currentStep && (
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                        <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse delay-100"></div>
                        <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse delay-200"></div>
                      </div>
                    )}
                  </div>
                  {index < currentStep && (
                    <div className="text-green-500">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 分析情報 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 企業情報 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
                <span>🏢</span>
                分析対象企業
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="font-medium text-blue-700">基準企業:</span>
                  <span className="text-gray-700">{companies.baseCompany.name}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    <span className="font-medium text-purple-700">比較企業:</span>
                  </div>
                  {companies.comparisonCompanies.map((company, index) => (
                    <div key={company.id} className="ml-4 text-gray-700">
                      {index + 1}. {company.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* LLMモデル情報 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
                <span>🧠</span>
                使用LLMモデル
              </h3>
              <div className="space-y-2 text-sm">
                <div className="font-medium text-gray-700">{model.name}</div>
                <div className="text-gray-600">
                  プロバイダー: {model.provider === 'azure-openai' ? 'Azure OpenAI' : 'Google Gemini'}
                </div>
                <div className="text-gray-600">
                  最大出力: {model.maxTokens.toLocaleString()} トークン
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                    入力: ${model.pricing.input}/1K
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    出力: ${model.pricing.output}/1K
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* プロンプト情報 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
              <span>📝</span>
              使用プロンプト
            </h3>
            <div className="space-y-2">
              <div className="font-medium text-gray-700">{prompt.name}</div>
              <div className="text-xs text-gray-500 bg-white rounded p-2 max-h-20 overflow-y-auto">
                {prompt.content.substring(0, 200)}...
              </div>
            </div>
          </div>

          {/* ローディングアニメーション */}
          <div className="flex justify-center py-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce delay-75"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>

          {/* 推定時間 */}
          <div className="text-center text-sm text-gray-500">
            <p>通常 30秒〜2分程度で完了します</p>
            <p className="text-xs mt-1">
              処理時間はプロンプトの長さと選択したLLMモデルによって変動します
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

