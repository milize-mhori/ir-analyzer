import React from 'react';
import { CompanyInput } from '@/components/CompanyInput';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useCompanies } from '@/hooks/useCompanies';

interface SummaryInputTabProps {
  onNext?: () => void;
}

export const SummaryInputTab: React.FC<SummaryInputTabProps> = ({ onNext }) => {
  const {
    companies,
    updateBaseCompany,
    updateComparisonCompany,
    addComparisonCompany,
    removeComparisonCompany,
    validateCompanies,
    getInputStatus,
  } = useCompanies();

  const inputStatus = getInputStatus();
  const validation = validateCompanies();

  const handleNext = () => {
    if (validation.isValid && onNext) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      {/* 進捗表示 */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-blue-900">入力進捗</h3>
            <p className="text-sm text-blue-700">
              {inputStatus.totalCompaniesFilled}社入力済み（基準企業 + 比較企業{companies.comparisonCompanies.length}社）
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {inputStatus.totalCompaniesFilled}/{companies.comparisonCompanies.length + 1}
            </div>
            <div className="text-xs text-blue-500">社完了</div>
          </div>
        </div>
      </Card>

      {/* 基準企業入力 */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          📊 基準企業（分析の中心となる企業）
        </h2>
        <CompanyInput
          company={companies.baseCompany}
          onUpdate={updateBaseCompany}
          title="基準企業"
          required
        />
      </div>

      {/* 比較企業入力 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            🔍 比較企業（基準企業と比較する企業）
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {companies.comparisonCompanies.length}/4社
            </span>
            {inputStatus.canAddMore && (
              <Button
                variant="secondary"
                onClick={addComparisonCompany}
                className="px-3 py-1 text-sm"
              >
                ＋ 企業追加
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {companies.comparisonCompanies.map((company, index) => (
            <CompanyInput
              key={company.id}
              company={company}
              onUpdate={(updatedCompany) => updateComparisonCompany(index, updatedCompany)}
              onDelete={inputStatus.canRemove ? () => removeComparisonCompany(index) : undefined}
              showDelete={inputStatus.canRemove}
              title={`比較企業 ${index + 1}`}
              required
            />
          ))}
        </div>
      </div>

      {/* バリデーションエラー表示 */}
      {!validation.isValid && (
        <Card className="bg-red-50 border-red-200">
          <h4 className="font-medium text-red-900 mb-2">入力内容を確認してください</h4>
          <ul className="space-y-1">
            {validation.errors.map((error, index) => (
              <li key={index} className="text-sm text-red-700 flex items-center">
                <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                {error}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* 操作ボタン */}
      <div className="flex justify-between items-center pt-6 border-t">
        <div className="text-sm text-gray-500">
          {validation.isValid ? (
            <span className="text-green-600 flex items-center">
              ✅ 入力完了
            </span>
          ) : (
            <span>
              必要な情報をすべて入力してください
            </span>
          )}
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            onClick={() => window.location.reload()}
          >
            リセット
          </Button>
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={!validation.isValid}
          >
            次へ：プロンプト設定 →
          </Button>
        </div>
      </div>

      {/* ヘルプ情報 */}
      <Card className="bg-gray-50 border-gray-200">
        <h4 className="font-medium text-gray-900 mb-2">💡 入力のコツ</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• <strong>基準企業</strong>：分析の中心となる企業を選んでください</li>
          <li>• <strong>比較企業</strong>：同業界や競合企業を1-4社まで入力可能です</li>
          <li>• <strong>IR要約</strong>：決算資料、説明会資料、有価証券報告書の要約を記載</li>
          <li>• <strong>推奨文字数</strong>：1企業あたり500-1000文字程度</li>
        </ul>
      </Card>
    </div>
  );
};
