import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { AnalysisResult } from '@/types';
import { ResultActions } from '@/components/ResultActions';

interface ResultTabProps {
  result: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;
  onBack?: () => void;
  onReExecute?: () => void;
  onNewAnalysis?: () => void;
  onNewsADClick?: () => void;
}

export const ResultTab: React.FC<ResultTabProps> = ({
  result,
  isLoading,
  error,
  onBack,
  onReExecute,
  onNewAnalysis,
  onNewsADClick,
}) => {
  // ローディング状態
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card title="🔄 分析実行中" subtitle="LLMによる比較分析を実行しています">
          <div className="flex flex-col items-center space-y-4 py-8">
            <Loading size="lg" text="分析を実行中..." />
            <div className="text-center text-gray-600">
              <p>企業情報をLLMに送信し、比較分析を行っています。</p>
              <p className="text-sm mt-2">通常30秒〜2分程度で完了します。</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // エラー状態
  if (error && !result) {
    return (
      <div className="space-y-6">
        <Card title="❌ 分析エラー" subtitle="分析実行中にエラーが発生しました">
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <h4 className="font-medium text-red-900 mb-2">エラー詳細</h4>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <h4 className="font-medium text-yellow-900 mb-2">💡 対処方法</h4>
              <ul className="text-yellow-800 text-sm space-y-1">
                <li>• API キーが正しく設定されているか確認してください</li>
                <li>• ネットワーク接続を確認してください</li>
                <li>• プロンプトが長すぎる場合は短縮してください</li>
                <li>• しばらく時間をおいてから再実行してください</li>
              </ul>
            </div>

            <div className="flex space-x-3">
              {onBack && (
                <Button variant="secondary" onClick={onBack}>
                  ← プロンプトを修正
                </Button>
              )}
              {onReExecute && (
                <Button variant="primary" onClick={onReExecute}>
                  🔄 再実行
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // 結果なし（初回表示）
  if (!result) {
    return (
      <div className="space-y-6">
        <Card title="📊 分析結果" subtitle="分析を実行すると結果がここに表示されます">
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">分析結果がありません</h3>
            <p className="text-gray-600 mb-6">
              企業情報とプロンプトを入力して分析を実行してください。
            </p>
            {onNewAnalysis && (
              <Button variant="primary" onClick={onNewAnalysis}>
                ← 企業入力から開始
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 実行情報 */}
      <Card title="📋 実行情報" subtitle={`${result.timestamp.toLocaleString()} に実行`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">分析設定</h4>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">使用モデル:</dt>
                <dd className="font-medium">{result.model.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">プロンプト:</dt>
                <dd className="font-medium">{result.prompt.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">ステータス:</dt>
                <dd className={`font-medium ${result.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {result.status === 'success' ? '✅ 成功' : '❌ エラー'}
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">対象企業</h4>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">基準企業:</dt>
                <dd className="font-medium">{result.companies.baseCompany.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">比較企業:</dt>
                <dd className="font-medium">{result.companies.comparisonCompanies.length}社</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">実行ID:</dt>
                <dd className="font-mono text-xs text-gray-500">{result.id}</dd>
              </div>
            </dl>
          </div>
        </div>
      </Card>

      {/* 使用量情報 */}
      <Card title="💰 使用量情報" subtitle="トークン使用量と推定料金">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {result.usage.inputTokens.toLocaleString()}
            </div>
            <div className="text-sm text-blue-800">入力トークン</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {result.usage.outputTokens.toLocaleString()}
            </div>
            <div className="text-sm text-green-800">出力トークン</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {(result.usage.inputTokens + result.usage.outputTokens).toLocaleString()}
            </div>
            <div className="text-sm text-purple-800">合計トークン</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              ${result.usage.estimatedCost.toFixed(4)}
            </div>
            <div className="text-sm text-orange-800">推定料金</div>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          * 料金は概算です。実際の料金は各プロバイダーの請求をご確認ください。
        </div>
      </Card>

      {/* 分析結果 */}
      <Card 
        title="📄 分析結果" 
        subtitle="LLMによる比較分析結果"
        headerAction={
          onNewsADClick && (
            <Button
              variant="primary"
              size="sm"
              onClick={onNewsADClick}
              className="flex items-center space-x-2"
            >
              <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
                <span className="text-blue-600 text-xs font-bold">N</span>
              </div>
              <span>NewsAD</span>
            </Button>
          )
        }
      >
        <div className="space-y-4">
          {result.status === 'error' && result.error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <h4 className="font-medium text-red-900 mb-2">エラー詳細</h4>
              <p className="text-red-700 text-sm">{result.error}</p>
            </div>
          )}
          
          <div className="bg-gray-50 border rounded-lg p-6">
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                {result.result || '結果を取得できませんでした。'}
              </pre>
            </div>
          </div>
        </div>
      </Card>

      {/* 操作ボタン */}
      <Card>
        <ResultActions
          result={result}
          onReExecute={onReExecute}
        />
        
        <div className="flex justify-between items-center mt-6 pt-6 border-t">
          <div className="text-sm text-gray-500">
            分析完了時刻: {result.timestamp.toLocaleString()}
          </div>
          
          <div className="flex space-x-3">
            {onBack && (
              <Button variant="secondary" onClick={onBack}>
                ← プロンプトを修正
              </Button>
            )}
            {onNewAnalysis && (
              <Button variant="secondary" onClick={onNewAnalysis}>
                🆕 新しい分析を開始
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

