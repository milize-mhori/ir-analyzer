import React from 'react';
import { Button } from '@/components/ui/Button';
import { useClipboard } from '@/hooks/useClipboard';
import { AnalysisResult } from '@/types';

interface ResultActionsProps {
  result: AnalysisResult;
  onReExecute?: () => void;
}

export const ResultActions: React.FC<ResultActionsProps> = ({
  result,
  onReExecute,
}) => {
  const { copyToClipboard, isCopied, error } = useClipboard();

  const handleCopyResult = async () => {
    const copyText = `## 分析結果
    
**実行日時**: ${result.timestamp.toLocaleString()}
**使用モデル**: ${result.model.name}
**プロンプト**: ${result.prompt.name}

**対象企業**:
- 基準企業: ${result.companies.baseCompany.name}
- 比較企業: ${result.companies.comparisonCompanies.map(c => c.name).join(', ')}

**使用量**:
- 入力トークン: ${result.usage.inputTokens.toLocaleString()}
- 出力トークン: ${result.usage.outputTokens.toLocaleString()}
- 推定料金: $${result.usage.estimatedCost.toFixed(4)}

---

${result.result}`;

    await copyToClipboard(copyText);
  };

  const handleCopyOnlyResult = async () => {
    await copyToClipboard(result.result);
  };

  const handleCopyPrompt = async () => {
    const promptText = `## 使用したプロンプト

**名前**: ${result.prompt.name}

**内容**:
${result.prompt.content}`;

    await copyToClipboard(promptText);
  };

  const handleCopyCompanies = async () => {
    const companiesText = `## 分析対象企業

**基準企業**: ${result.companies.baseCompany.name}
${result.companies.baseCompany.summary}

**比較企業**:
${result.companies.comparisonCompanies.map((company, index) => 
  `${index + 1}. ${company.name}\n${company.summary}`
).join('\n\n')}`;

    await copyToClipboard(companiesText);
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">📋 結果操作</h4>
      
      {/* メイン操作ボタン */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Button
          variant="primary"
          onClick={handleCopyResult}
          className="flex items-center justify-center space-x-2"
        >
          <span>{isCopied ? '✅' : '📋'}</span>
          <span>{isCopied ? 'コピー完了！' : '分析結果をコピー'}</span>
        </Button>
        
        {onReExecute && (
          <Button
            variant="secondary"
            onClick={onReExecute}
            className="flex items-center justify-center space-x-2"
          >
            <span>🔄</span>
            <span>再実行</span>
          </Button>
        )}
      </div>

      {/* 詳細コピーオプション */}
      <div className="border-t pt-4">
        <h5 className="text-sm font-medium text-gray-700 mb-2">詳細コピー</h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Button
            variant="secondary"
            onClick={handleCopyOnlyResult}
            className="text-sm py-2"
          >
            📄 結果のみ
          </Button>
          <Button
            variant="secondary"
            onClick={handleCopyPrompt}
            className="text-sm py-2"
          >
            💬 プロンプト
          </Button>
          <Button
            variant="secondary"
            onClick={handleCopyCompanies}
            className="text-sm py-2"
          >
            🏢 企業情報
          </Button>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-700 text-sm">⚠️ {error}</p>
        </div>
      )}

      {/* 使用量詳細 */}
      <div className="bg-gray-50 rounded-md p-3">
        <h5 className="text-sm font-medium text-gray-700 mb-2">📊 詳細情報</h5>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600">
          <div>
            <div className="font-medium">実行ID</div>
            <div className="font-mono">{result.id}</div>
          </div>
          <div>
            <div className="font-medium">プロバイダー</div>
            <div>{result.model.provider}</div>
          </div>
          <div>
            <div className="font-medium">モデル</div>
            <div>{result.model.modelName}</div>
          </div>
          <div>
            <div className="font-medium">実行時間</div>
            <div>{result.timestamp.toLocaleTimeString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
